import tabula
import pandas as pd

pdf_path = "BCA_UG_Framework.pdf"
tables = tabula.read_pdf(pdf_path, pages='all', multiple_tables=True)

courses = []

for table in tables:
    # Basic cleaning (replace NaN with None)
    table = table.where(pd.notnull(table), None)

    # Assuming the relevant data is in a table with specific column names
    if "Course Code" in table.columns and "Course/Paper Title" in table.columns and "Credit" in table.columns:
        for index, row in table.iterrows():
            code = row["Course Code"]
            title = row["Course/Paper Title"]
            credit = row["Credit"]

            # Simple checks to ensure data is valid (not None or NaN)
            if code and title and credit is not None:
                # Extract program, year, and semester from the code (this logic might need adjustment)
                if isinstance(code, str) and len(code) >= 10:  # Basic check for code length
                    program = "BCA"  # Assuming all from this PDF are BCA
                    year = int(code[4]) if code[4].isdigit() else None
                    semester = int(code[5]) if code[5].isdigit() else None

                    if year and semester:
                      courses.append({
                          "code": code,
                          "title": str(title),  # Ensure title is a string
                          "program": program,
                          "year": year,
                          "semester": semester,
                          "credits": int(credit) if isinstance(credit, (int, float)) else int(float(credit)) if isinstance(credit, str) and credit.replace('.', '', 1).isdigit() else None
                      })


# Print the extracted courses (for now)
for course in courses:
    print(course)