import os
import subprocess, sys

from flask import Flask, render_template, send_from_directory, request, json, redirect, url_for
from flask.ext.mysql import MySQL
# from werkzeug import generate_password_hash, check_password_hash, secure_filename
from uuid import uuid4
import glob
mysql = MySQL()
app = Flask(__name__, static_url_path='')
app.config.from_object(__name__)

# MySQL configurations
app.config['MYSQL_DATABASE_USER'] = 'dglin'
app.config['MYSQL_DATABASE_PASSWORD'] = '**********s'
app.config['MYSQL_DATABASE_DB'] = 'Resumes'
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
mysql.init_app(app)

ALLOWED_EXTENSIONS = ['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif']

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

app.config['UPLOAD_FOLDER'] = 'files/'

def allowed_filename(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1] in app.config['ALLOWED_EXTENSIONS']

# returns dumped version of JSON file. .json -> python dict -> python string
def loadJSON(filename):
	with open(filename) as data_file:
		data = json.load(data_file)
	# print type(data)
	return json.dumps(data)

def fixTitle(filename):
    line = filename.replace(" ","")
    return line



@app.route('/submit',methods=['POST','GET'])
def submit():
    try:
        _name = request.form['inputName']
        _email = request.form['inputEmail']
        _year = request.form['year']
        _major = request.form['major']
        _major2 = request.form['major2']
        _minor = request.form['minor']
        _minor2 = request.form['minor2']
        _cgpa = request.form['cgpa']
        _mgpa = request.form['mgpa']
        _exp1 = request.form['exp1']
        _exp2 = request.form['exp2']
        _exp3 = request.form['exp3']
        _exp4 = request.form['exp4']
        _exp5 = request.form['exp5']

        # validate the received values
        if _name and _email:# and file and allowed_filename(file.filename):
            
            # All Good, let's call MySQL
            # filename = secure_filename(file.filename)
            # file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            conn = mysql.connect()
            cursor = conn.cursor()
            cursor.callproc('sp_createUser',(_name,_email,_year,_major,_major2,_minor,_minor2,_cgpa,_mgpa,_exp1,_exp2,_exp3,_exp4,_exp5))
            data = cursor.fetchall()

            if len(data) is 0:
                conn.commit()
                return json.dumps({'message':'User created successfully !'})
            else:
                return json.dumps({'error':str(data[0])})
        else:
            return json.dumps({'html':'<span>Enter the required fields</span>'})

    except Exception as e:
        return json.dumps({'error':str(e)})
    finally:
        cursor.close() 
        conn.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route("/upload", methods=["POST"])
def upload():
    """Handle the upload of a file."""
    form = request.form

    # Create a unique "session ID" for this particular batch of uploads.
    # upload_key = str(uuid4())
    _fname = request.form['inputFName']
    _lname = request.form['inputLName']
    _name = _fname + _lname
    _email = request.form['inputEmail']
    upload_key = _name + '-' + _email
    upload_key = fixTitle(upload_key)
    # Is the upload using Ajax, or a direct POST by the form?
    is_ajax = False
    if form.get("__ajax", None) == "true":
        is_ajax = True

    # Target folder for these uploads.
    target = "static/files/{}".format(upload_key)
    try:
        os.mkdir(target)
    except:
        if is_ajax:
            return ajax_response(False, "Couldn't create upload, most likely since record already exists")
        else:
            return "Couldn't create upload directory: {}".format(target)

    print "=== Form Data ==="
    for key, value in form.items():
        print key, "=>", value
    filename = ""
    destination = ""
    for upload in request.files.getlist("file"):
        filename = upload.filename.rsplit("/")[0]
        destination = "/".join([target, filename])
        print "Accept incoming file:", filename
        print "Save it to:", fixTitle(destination)
        upload.save(fixTitle(destination))

    location = fixTitle("./" + destination)

    JSON = fixTitle(target + "/" + upload_key + ".json")

    # print parameters
    p = subprocess.Popen(["powershell.exe", "C:\\Users\\Administrator\\Desktop\\database\\parse.ps1 ",location,JSON], stdout=sys.stdout)
    p.communicate()

    if is_ajax:
        return loadJSON(JSON)
    else:
        return redirect(url_for("upload_complete", uuid=upload_key))


@app.route("/files/<uuid>")
def upload_complete(uuid):
    """The location we send them to at the end of the upload."""

    # Get their files.
    root = "static/files/{}".format(uuid)
    if not os.path.isdir(root):
        return "Error: UUID not found!"

    files = []
    for file in glob.glob("{}/*.*".format(root)):
        fname = file.split(os.sep)[-1]
        files.append(fname)

    return render_template("files.html",
        uuid=uuid,
        files=files,
    )


def ajax_response(status, msg):
    status_code = "ok" if status else "error"
    return json.dumps(dict(
        status=status_code,
        msg=msg,
    ))


@app.route('/done')
def done():
    return render_template('done.html')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port = 80, debug = True)