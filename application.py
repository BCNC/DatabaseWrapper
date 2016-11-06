import boto3
from flask import Flask, render_template, request, redirect, url_for
from uuid import uuid4
from util import *
from ajax import *

application = Flask(__name__, static_url_path='')

try:
    ddbregion = 'us-west-2'
    tablename = 'BCNCResumes'
    ddb = boto3.resource('dynamodb', region_name=ddbregion)
    table = ddb.Table(tablename)
except Exception as err:
    print "DynamoDB failed to initialize because: " + str(err)
    exit()
print "DynamoDB finished initializing."

try:
    s3region = 'us-west-2'
    s3bucket = 'bcncresumes'
    s3 = boto3.resource('s3', region_name=s3region)
except Exception as err:
    print "S3 Failed to initialize because: " + str(err)
    exit()
print "S3 finished initializing."

try:
    sesregion = 'us-west-2'
    ses = boto3.client('ses', region_name=sesregion)
except Exception as err:
    print "SES Failed to initialize because: " + str(err)
    exit()
print "SES finished initializing."

@application.route('/')
def index():
    return render_template('index.html')

@application.route("/upload", methods=['POST','GET'])
def upload():
    try:
    	form = request.form
        flag = False
        _uploadKey = str(request.form['inputUploadKey'])
        if not _uploadKey:
            _uploadKey = str(uuid4())
            flag = True
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
        if validateInput(_email, _gpa, _year) != "OK":
            return ajax_response(False, validation)
        elif len(request.files.getlist("file")) == 0:
            return ajax_response(False, "Please upload a file.")
        elif flag and not (queryDDB(_name).get('Item') is None):
            return ajax_response(False, "An entry with this name: " + _name + " already exists. If this is a mistake shoot an email to contactbcnc@gmail.com")

        # Add entry to DDB
        response = table.put_item(Item=fillItem(_uploadKey, _name, _email, _primary, _secondary, _gpa, _year))

        # Add files to S3
        for upload in request.files.getlist("file"):
            s3.Bucket(s3bucket).put_object(Key=_name + '/' + upload.filename.rsplit("/")[0], Body=upload)
    except Exception as e:
        return ajax_response(False, str(e))
    sendConfirmationEmail(ses, _name ,_uploadKey,_email)
    return ajax_response(True, "Your information has successfully been recorded.\nYou should receive an email from contactbcnc@gmail.com containing an upload key in case of future updates.\n\nUpload Key: " + _uploadKey)

@application.route("/update", methods=['POST','GET'])
def update():
    try:
        form = request.form
        print form
        _requestedUploadKey = str(request.form['inputUploadKey'])
        _firstName = str(request.form['inputFName'])
        _lastName = str(request.form['inputLName'])
        _name = _firstName + " " + _lastName
        print _requestedUploadKey + _name

        if queryDDB(_name).get('Item') is None:
            return ajax_response(False, "No entry under this name exists")
        else:
            item = queryDDB(_name).get('Item')
        if item.get('UploadKey') != _requestedUploadKey:
            return ajax_response(False, "Entered Upload Key does not match the one in the database.")
        else:
            return ajax_response_item(True, item)
    except Exception as e:
        return ajax_response(False, str(e))

def queryDDB(name):
    try:
        item = table.get_item(Key={'Name': name})
    except boto.dynamodb.exceptions.DynamoDBKeyNotFoundError:
        item = None
    return item

if __name__ == "__main__":
    application.debug = False
    application.run()








