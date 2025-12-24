export const employeeSignUp = async(req, res, next) =>{
    res.json({ message: "Employee sign up" });
}

export const employeeSignIn = async(req, res, next) =>{
    res.json({ message: "Employee sign in" });
}

export const employeeSignOut = async(req, res, next) =>{
    res.json({ message: "Employee sign out" });
}