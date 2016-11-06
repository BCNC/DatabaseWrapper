from flask import json

def ajax_response(status, msg):
    status_code = "ok" if status else "error"
    return json.dumps(dict(
        status=status_code,
        msg=msg,
))

def ajax_response_item(status,item):
    status_code = "ok" if status else "error"
    return json.dumps(dict(
        status=status_code,
        item=item,
))  