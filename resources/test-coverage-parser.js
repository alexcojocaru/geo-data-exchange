const fs = require("fs");
const path = require("path");
const replace = require("replace-in-file");

function resetReadme() {
    console.log("Resetting the coverage report in README.md");

    replaceInFile("N/A", "N/A", "N/A", "N/A", "N/A");
}

function updateReadme(statements, branches, functions, lines) {
    const overall = avg(statements, branches, functions, lines);

    console.log("Updating the coverage report in README.md with:");
    console.log("  statements:", statements);
    console.log("  branches:", branches);
    console.log("  functions:", functions);
    console.log("  lines:", lines);
    console.log("  overall:", overall.toFixed(2));

    replaceInFile(
            overall.toFixed(0) + "%",
            statements.toFixed(0), 
            branches.toFixed(0),
            functions.toFixed(0),
            lines.toFixed(0)
    );
}

function avg() {
    return arguments.length === 0
            ? 0
            : Array.from(arguments).reduce((acc, val) => acc + val) / arguments.length;
}

function replaceInFile(overall, statements, branches, functions, lines) {
    const options = {
        files: path.join(__dirname, "../README.md"),
        from: [
            /coverage: \[([\d\.%]+|N\/A)\]/,
            /<a name="test-coverage-report"><\/a>\s+```\s+(.+)\s+(.+)\s+(.+)\s+(.+)\s+```/m,
        ],
        to: [
            `coverage: [${overall}]`,
            `<a name="test-coverage-report"></a>
\`\`\`
  % Statements: ${statements}
  %   Branches: ${branches}
  %  Functions: ${functions}
  %      Lines: ${lines}
\`\`\``
        ]
    };

    replace(options, (error, results) => {
        if (error) {
            console.error("Cannot replace in file; error:", error);
            process.exit(1);
        }
    });
}

fs.readFile(
        path.join(__dirname, "../coverage/coverage-summary.json"),
        "utf8",
        (err, data) => {
            if (err) {
                console.log(`Cannot read the coverage summary: ${err}`);
                resetReadme();
            }
            else {
                report = JSON.parse(data);
                updateReadme(
                    report.total.statements.pct,
                    report.total.branches.pct,
                    report.total["functions"].pct,
                    report.total.lines.pct
                );
            }
        }
);
