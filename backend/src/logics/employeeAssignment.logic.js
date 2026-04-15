import { NotFoundError, ValidationError } from "../utils/errors.util.js";

const normalizeWords = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 3);

const scoreSpecialityMatch = (speciality, serviceNames) => {
  const specialityText = String(speciality || "").toLowerCase();
  if (!specialityText) return 0;

  const keywords = [
    ...new Set(serviceNames.flatMap((name) => normalizeWords(name))),
  ];
  if (keywords.length === 0) return 0;

  let matches = 0;
  for (const keyword of keywords) {
    if (specialityText.includes(keyword)) {
      matches += 1;
    }
  }

  return matches;
};

export const resolveAutoAssignedEmployee = async ({
  client,
  serviceIds,
  locationType = "branch",
}) => {
  if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
    throw new ValidationError(
      "At least one service is required for assignment",
    );
  }

  const servicesResult = await client.query(
    `SELECT serviceid, servicename, servicetype
     FROM service
     WHERE serviceid = ANY($1)`,
    [serviceIds],
  );

  if (servicesResult.rowCount !== serviceIds.length) {
    throw new NotFoundError("One or more service IDs do not exist");
  }

  const packageCount = servicesResult.rows.filter(
    (service) => service.servicetype === "package",
  ).length;

  if (packageCount > 1) {
    throw new ValidationError("You can only select one Service Package.");
  }

  const employeesResult = await client.query(`
    WITH workload AS (
      SELECT
        ea.empid,
        COUNT(*) FILTER (
          WHERE s.schedulestartdate = CURRENT_DATE
        ) AS today_jobs,
        COUNT(*) FILTER (
          WHERE s.schedulestartdate >= CURRENT_DATE
            AND s.schedulestartdate < CURRENT_DATE + INTERVAL '14 days'
        ) AS upcoming_jobs
      FROM employeeassigned ea
      JOIN schedule s ON s.bookingid = ea.bookingid
      JOIN booking b ON b.bookingid = ea.bookingid
      WHERE b.bookingstatus IN ('pending', 'inProgress')
      GROUP BY ea.empid
    )
    SELECT
      e.empid,
      e.first_name,
      e.last_name,
      e.emptype,
      e.speciality,
      COALESCE(w.today_jobs, 0) AS today_jobs,
      COALESCE(w.upcoming_jobs, 0) AS upcoming_jobs
    FROM employee e
    LEFT JOIN workload w ON w.empid = e.empid
    WHERE e.emptype NOT IN ('owner', 'cashier', 'manager')
      AND NOT EXISTS (
        SELECT 1
        FROM employeeleave el
        WHERE el.empid = e.empid
          AND CURRENT_DATE BETWEEN el.leavestartdate AND el.leaveenddate
      )
    ORDER BY e.empid ASC
  `);

  if (employeesResult.rowCount === 0) {
    throw new ValidationError(
      "No eligible employees are currently available for assignment.",
    );
  }

  const serviceNames = servicesResult.rows.map(
    (service) => service.servicename,
  );

  const rankedEmployees = employeesResult.rows
    .map((employee) => {
      const specialityScore = scoreSpecialityMatch(
        employee.speciality,
        serviceNames,
      );
      const todayJobs = Number(employee.today_jobs) || 0;
      const upcomingJobs = Number(employee.upcoming_jobs) || 0;
      const workloadScore = todayJobs * 3 + upcomingJobs;

      return {
        ...employee,
        specialityScore,
        workloadScore,
      };
    })
    .sort((a, b) => {
      if (b.specialityScore !== a.specialityScore) {
        return b.specialityScore - a.specialityScore;
      }
      if (a.workloadScore !== b.workloadScore) {
        return a.workloadScore - b.workloadScore;
      }
      return a.empid - b.empid;
    });

  const selectedEmployee = rankedEmployees[0];

  return {
    employeeId: selectedEmployee.empid,
    employee: {
      empid: selectedEmployee.empid,
      name: `${selectedEmployee.first_name} ${selectedEmployee.last_name}`.trim(),
      emptype: selectedEmployee.emptype,
      speciality: selectedEmployee.speciality,
    },
    assignmentMeta: {
      mode: "auto",
      locationType,
      serviceNames,
      specialityScore: selectedEmployee.specialityScore,
      workloadScore: selectedEmployee.workloadScore,
      todayJobs: Number(selectedEmployee.today_jobs) || 0,
      upcomingJobs: Number(selectedEmployee.upcoming_jobs) || 0,
    },
  };
};
