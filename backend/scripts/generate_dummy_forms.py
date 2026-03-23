import os
import sys

# Change to backend dir
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)

# Ensure reportlab is installed
try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
except ImportError:
    import subprocess
    print("Installing reportlab to generate PDFs...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "reportlab"])
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors

# Create generic form generator
def create_pdf_form(filename, title, fields, description):
    save_path = os.path.join(current_dir, filename)
    
    c = canvas.Canvas(save_path, pagesize=letter)
    width, height = letter
    
    # Title
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width / 2.0, height - 50, title)
    
    # Description
    c.setFont("Helvetica", 12)
    c.setFillColor(colors.gray)
    c.drawCentredString(width / 2.0, height - 80, description)
    
    # Fields
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 12)
    y_position = height - 130
    
    for field in fields:
        c.drawString(50, y_position, f"{field}:")
        # Draw a line for the input area
        c.line(50 + c.stringWidth(f"{field}:", "Helvetica-Bold", 12) + 10, y_position - 2, 500, y_position - 2)
        y_position -= 40
        
    # Signature Box
    c.rect(50, y_position - 60, 200, 50)
    c.setFont("Helvetica", 10)
    c.drawString(60, y_position - 75, "Student Signature")
    
    c.rect(300, y_position - 60, 200, 50)
    c.drawString(310, y_position - 75, "Authorized Signature (Office Use Only)")

    c.save()
    print(f"Generated dummy form: {save_path}")

if __name__ == "__main__":
    if not os.path.exists(current_dir):
        os.makedirs(current_dir, exist_ok=True)
        
    forms_to_create = [
        {
            "filename": "leave_application.pdf",
            "title": "Student Leave Application",
            "description": "Form for requesting authorized absence from academic duties.",
            "fields": ["Student Name", "Enrollment Number", "Course/Department", "Date(s) of Leave", "Reason for Leave", "Contact Phone"]
        },
        {
            "filename": "fee_concession.pdf",
            "title": "Fee Concession Application",
            "description": "Form for requesting financial aid or fee reduction based on merit or need.",
            "fields": ["Student Name", "Enrollment Number", "Annual Family Income", "Previous Semester GPA", "Category (Merit/Need/Sports)", "Requested Concession %"]
        },
        {
            "filename": "hostel_registration.pdf",
            "title": "Hostel Registration Form",
            "description": "Form for new students initiating on-campus housing accommodation.",
            "fields": ["Student Name", "Enrollment Number", "Gender", "Permanent Address", "Parent/Guardian Name", "Emergency Contact", "Room Preference"]
        }
    ]
    
    for form in forms_to_create:
        create_pdf_form(
            filename=form["filename"],
            title=form["title"],
            description=form["description"],
            fields=form["fields"]
        )
    
    print("\nAll dummy forms generated successfully in backend/scripts directory!")
