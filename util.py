import re

EMAIL_REGEX = re.compile(r"[^@\s]+@[^@\s]+\.[^@\s.]+$")
GPA_REGEX = re.compile("^[0-9]\.[0-9]+$")
Body = """\nThank you for entering BCNC database!\nIf the BCNC network find an opportunity that fits your qualifications, we will contact you\n\nIf you're information changes, or if you would like to update your entry, please save this key: """
def validateInput(email, gpa, year):
	try:
		if not EMAIL_REGEX.match(email):
			return "Input email is not valid. Please check for typos."
		elif not GPA_REGEX.match(gpa) or float(gpa) > 4.0:
			return "Input GPA is not valid. Must be in format D.DD, where 'D' is a digit. Must be on 4.0 scale."
			# TODO: currently just makes sure reasonable. Probably narrow by current date.
		elif int(year) < 1950 or int(year) > 2050:
			return "Input graduation date must be somewhat reasonable."
		else:
			return "OK"
	except ValueError:
		return "Input graduation date must be a number in the 2000's. GPA must be on 4.0 scale."

def sendConfirmationEmail(ses, name, uploadKey, destination):
    try:
        response = ses.send_email(
            Source='contactbcnc@gmail.com',
            Destination={
                'ToAddresses': [
                    destination,
                ]
            },
            Message={
                'Subject': {
                    'Data': 'BCNC Database Upload Confirmation',
                    'Charset': 'UTF-8'
                },
                'Body': {
                    'Text': {
                        'Data': "Hello " + name + Body + uploadKey + "\n\nThe BCNC club",
                        'Charset': 'UTF-8'
                    },
                }
            }
        )
    except Exception as err:
        print str(err)

def fillItem(uuid, name, email, pmajor, smajor, gpa, year):
    Item =  {
        'UploadKey' : uuid,
        'Name' : name,
        'Email' : email,
        'Primary Major' : pmajor,
        'GPA' : gpa,
        'Graduation Year' : year
    }
    if not smajor:
        return Item
    else:
        Item['Secondary Major'] = smajor
        return Item