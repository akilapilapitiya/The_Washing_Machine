const fs = require('fs');
const path = require('path');

const directoriesToProcess = [
    "src/features/admin",
    "src/features/dashboard",
    "src/features/employee",
    "src/features/vehicles",
];

const walkSync = (dir, filelist = []) => {
    if (!fs.existsSync(dir)) return filelist;
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        if (fs.statSync(dirFile).isDirectory()) {
            filelist = walkSync(dirFile, filelist);
        } else if (file.endsWith('.jsx')) {
            filelist.push(dirFile);
        }
    });
    return filelist;
};

directoriesToProcess.forEach(directory => {
    const files = walkSync(directory);
    files.forEach(filepath => {
        let content = fs.readFileSync(filepath, 'utf8');
        const originalContent = content;

        // Remove the outer wrapper: <div className="min-h-screen bg-gray-50">
        if (content.includes('<div className="min-h-screen bg-gray-50">')) {
            content = content.replace('<div className="min-h-screen bg-gray-50">\n', '');
            content = content.replace('<div className="min-h-screen bg-gray-50 pb-12">\n', '');
            content = content.replace('<div className="min-h-screen bg-gray-50">\r\n', '');

            // remove leading spaces for removed element if remaining
            content = content.replace(/[ \t]*<div className="min-h-screen bg-gray-50"> *\r?\n/g, '');

            // Find the last closing div and remove it
            const lastDivIndex = content.lastIndexOf('</div>');
            if (lastDivIndex !== -1) {
                content = content.substring(0, lastDivIndex) + content.substring(lastDivIndex + 6);
            }
        }

        // Standardize the inner container wrapper and remove redundant spacing/px
        content = content.replace(
            /<div className="container mx-auto px-4 py-8 space-y-(\d+) max-w-(7xl|6xl|5xl|4xl)">/g,
            '<div className="mx-auto w-full max-w-$2 space-y-$1">'
        );
        content = content.replace(
            /<div className="container mx-auto px-4 py-4 max-w-(7xl|6xl|5xl|4xl)">/g,
            '<div className="mx-auto w-full max-w-$1">'
        );
        content = content.replace(
            /<div className="mx-auto px-4 py-8 space-y-(\d+) max-w-(7xl|6xl|5xl|4xl)">/g,
            '<div className="mx-auto w-full max-w-$2 space-y-$1">'
        );

        if (content !== originalContent) {
            fs.writeFileSync(filepath, content, 'utf8');
            console.log(`Updated ${filepath}`);
        }
    });
});
