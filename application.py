import boto3
import re
from flask import Flask, render_template, request, json, redirect, url_for
from uuid import uuid4

application = Flask(__name__, static_url_path='')

##############DDB#######################################
ddbregion = 'us-west-2'
tablename = 'BCNCResumes'
ddb = boto3.resource('dynamodb', region_name=ddbregion)
table = ddb.Table(tablename)
########################################################
##############S3########################################
s3region = 'us-west-2'
s3bucket = 'bcncresumes'
s3 = boto3.resource('s3', region_name=s3region)
########################################################

@application.route('/')
def index():
    return render_template('index.html')

@application.route("/upload", methods=['POST','GET'])
def upload():
    try:
    	form = request.form

        _uploadKey = str(uuid4())
        _firstName = str(request.form['inputFName'])
        _lastName = str(request.form['inputLName'])
        _name = _firstName + " " + _lastName
    	_email = str(request.form['inputEmail'])
    	_primary = str(request.form['inputPMajor'])
    	_secondary = str(request.form['inputSMajor'])
    	_gpa = str(request.form['inputGPA'])
    	_year = str(request.form['inputGradYear'])

    	if not (_firstName and _lastName and _email and _primary and _gpa and _year):
    		return ajax_response(False, "A required field has been left blank.") 

        # Validate the input
        validation = validateInput(_email, _gpa, _year)
        print queryDDB(_name)
        if validateInput(_email, _gpa, _year) != "OK":
            return ajax_response(False, validation)
        elif len(request.files.getlist("file")) == 0:
            return ajax_response(False, "Please upload a file.")
        elif not (queryDDB(_name).get('Item') is None):
            return ajax_response(False, "An entry with this name: " + _name + " already exists. If this is a mistake shoot an email to contactbcnc@gmail.com")

        # Add entry to DDB
        response = table.put_item(Item=fillItem(_uploadKey, _name, _email, _primary, _secondary, _gpa, _year))

        # Add files to S3
        for upload in request.files.getlist("file"):
            s3.Bucket(s3bucket).put_object(Key=_name + '/' + upload.filename.rsplit("/")[0], Body=upload)
    except Exception as e:
        return ajax_response(False, str(e))
    return ajax_response(True, "Your information has successfully been recorded.") # Your upload key is as follows: " + _uploadKey + " if you would like to modify your submission in the future.")

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

def ajax_response(status, msg):
    status_code = "ok" if status else "error"
    return json.dumps(dict(
        status=status_code,
        msg=msg,
))

def queryDDB(name):
    try:
        item = table.get_item(Key={'Name': name})
    except boto.dynamodb.exceptions.DynamoDBKeyNotFoundError:
        item = None
    return item


EMAIL_REGEX = re.compile(r"[^@\s]+@[^@\s]+\.[^@\s.]+$")
GPA_REGEX = re.compile("^[0-9]\.[0-9]+$")
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

if __name__ == "__main__":
    application.debug = True
    application.run()









