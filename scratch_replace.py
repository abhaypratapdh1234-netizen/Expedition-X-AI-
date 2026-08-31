import sys

filepath = r"c:\Users\Abhay Pratap\OneDrive\Desktop\Expedition X AI\src\pages\public\ForgotPasswordPage.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace teal classes with orange
content = content.replace('bg-teal-', 'bg-orange-')
content = content.replace('shadow-teal-', 'shadow-orange-')
content = content.replace('border-teal-', 'border-orange-')
content = content.replace('ring-teal-', 'ring-orange-')
content = content.replace('text-teal-', 'text-orange-')

# Replace exact hex gradients for buttons
content = content.replace('#0f766e', '#c2410c') # orange-700
content = content.replace('#14b8a6', '#f97316') # orange-500

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully replaced all teal accents with orange.")
