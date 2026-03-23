"""
Generate dummy PDF application forms for the Smart College Portal.
Saves them into  backend/data/uploads/forms/
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fpdf import FPDF

FORMS_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "uploads", "forms")
os.makedirs(FORMS_DIR, exist_ok=True)

FORMS = [
    {
        "filename": "admission_application_form.pdf",
        "title": "Admission Application Form",
        "heading": "SMART COLLEGE - ADMISSION APPLICATION FORM",
        "fields": [
            "Full Name: ___________________________________",
            "Date of Birth: ____/____/________",
            "Gender:  [ ] Male   [ ] Female   [ ] Other",
            "Nationality: ________________________________",
            "Address: _____________________________________",
            "_____________________________________________",
            "Phone Number: _______________________________",
            "Email Address: ______________________________",
            "Course Applied For: _________________________",
            "Previous Qualification: _____________________",
            "Percentage / CGPA: __________________________",
            "Year of Passing: ____________________________",
            "",
            "Documents to Attach:",
            "  [ ] 10th Marksheet   [ ] 12th Marksheet",
            "  [ ] Transfer Certificate   [ ] Passport Photo",
            "  [ ] Aadhaar / ID Proof",
            "",
            "Applicant Signature: ________________________",
            "Date: ____/____/________",
        ],
    },
    {
        "filename": "scholarship_application_form.pdf",
        "title": "Scholarship Application Form",
        "heading": "SMART COLLEGE - SCHOLARSHIP APPLICATION FORM",
        "fields": [
            "Full Name: ___________________________________",
            "Enrollment Number: __________________________",
            "Department: _________________________________",
            "Current Semester: ___________________________",
            "CGPA (Latest): _____________________________",
            "Annual Family Income: _______________________",
            "Scholarship Type Applied For:",
            "  [ ] Merit-Based   [ ] Need-Based   [ ] Sports",
            "  [ ] Research Grant   [ ] Other: ___________",
            "",
            "Brief Statement (Why you deserve this scholarship):",
            "________________________________________________",
            "________________________________________________",
            "________________________________________________",
            "",
            "Faculty Recommendation: ______________________",
            "Applicant Signature: ________________________",
            "Date: ____/____/________",
        ],
    },
    {
        "filename": "leave_application_form.pdf",
        "title": "Leave Application Form",
        "heading": "SMART COLLEGE - LEAVE APPLICATION FORM",
        "fields": [
            "Full Name: ___________________________________",
            "Enrollment / Employee Number: _______________",
            "Department: _________________________________",
            "Semester / Designation: _____________________",
            "Leave Type:  [ ] Sick   [ ] Personal   [ ] Other",
            "Leave From: ____/____/________",
            "Leave To:   ____/____/________",
            "Total Days: _________________________________",
            "",
            "Reason for Leave:",
            "________________________________________________",
            "________________________________________________",
            "________________________________________________",
            "",
            "Contact During Leave: _______________________",
            "Applicant Signature: ________________________",
            "HOD / Advisor Signature: ____________________",
            "Date: ____/____/________",
        ],
    },
    {
        "filename": "bonafide_certificate_request.pdf",
        "title": "Bonafide Certificate Request Form",
        "heading": "SMART COLLEGE - BONAFIDE CERTIFICATE REQUEST",
        "fields": [
            "Full Name: ___________________________________",
            "Enrollment Number: __________________________",
            "Department: _________________________________",
            "Current Semester: ___________________________",
            "Purpose of Certificate:",
            "  [ ] Bank Loan   [ ] Passport   [ ] Visa",
            "  [ ] Higher Education   [ ] Other: _________",
            "",
            "Number of Copies Required: __________________",
            "Urgent Request:  [ ] Yes   [ ] No",
            "",
            "Applicant Signature: ________________________",
            "HOD Signature: ______________________________",
            "Date: ____/____/________",
        ],
    },
    {
        "filename": "hostel_application_form.pdf",
        "title": "Hostel Application Form",
        "heading": "SMART COLLEGE - HOSTEL APPLICATION FORM",
        "fields": [
            "Full Name: ___________________________________",
            "Enrollment Number: __________________________",
            "Department: _________________________________",
            "Current Semester: ___________________________",
            "Gender:  [ ] Male   [ ] Female",
            "Home Address: ________________________________",
            "_____________________________________________",
            "Guardian Name: ______________________________",
            "Guardian Phone: _____________________________",
            "Room Preference:  [ ] Single   [ ] Shared",
            "Mess Preference:  [ ] Veg   [ ] Non-Veg",
            "",
            "Medical Conditions (if any): _________________",
            "________________________________________________",
            "",
            "Applicant Signature: ________________________",
            "Parent / Guardian Signature: ________________",
            "Date: ____/____/________",
        ],
    },
]

DESCRIPTIONS = {
    "Admission Application Form": "Official admission application form for new students applying to Smart College.",
    "Scholarship Application Form": "Apply for merit-based, need-based, or sports scholarships at Smart College.",
    "Leave Application Form": "Standard leave application form for students and staff.",
    "Bonafide Certificate Request Form": "Request a bonafide certificate for bank loans, passports, visas, or higher education.",
    "Hostel Application Form": "Apply for on-campus hostel accommodation at Smart College.",
}


def create_forms():
    """Create all dummy PDF forms and return metadata list."""
    created = []
    for form in FORMS:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        # Header bar
        pdf.set_fill_color(75, 0, 130)  # indigo
        pdf.rect(0, 0, 210, 30, "F")
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Helvetica", "B", 16)
        pdf.set_y(8)
        pdf.cell(0, 14, form["heading"], align="C", new_x="LMARGIN", new_y="NEXT")

        # Reset colour
        pdf.set_text_color(0, 0, 0)
        pdf.ln(10)

        # Subtitle
        pdf.set_font("Helvetica", "I", 9)
        pdf.cell(0, 6, "Please fill in all fields and submit to the respective department.", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(4)

        # Fields
        pdf.set_font("Helvetica", "", 11)
        for line in form["fields"]:
            if line == "":
                pdf.ln(4)
            else:
                pdf.cell(0, 8, line, new_x="LMARGIN", new_y="NEXT")

        # Footer
        pdf.ln(10)
        pdf.set_font("Helvetica", "I", 8)
        pdf.set_text_color(120, 120, 120)
        pdf.cell(0, 5, "Smart College Web Portal  |  This is a computer-generated form", align="C")

        filepath = os.path.join(FORMS_DIR, form["filename"])
        pdf.output(filepath)
        created.append({
            "title": form["title"],
            "description": DESCRIPTIONS.get(form["title"], ""),
            "file_path": filepath,
        })
        print(f"  Created: {form['filename']}")

    return created


if __name__ == "__main__":
    print("Generating dummy PDF forms...")
    create_forms()
    print("Done!")
