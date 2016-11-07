
var MAX_UPLOAD_FILE_SIZE = 25*1024*1024; // 25 MB
var UPLOAD_URL = "/upload";
var UPDATE_URL = "/update";
var NEXT_URL   = "/files/";
var DONE = "/done";

var PENDING_FILES  = [];


// Fancy JQuery for input text animation.
$('.form').find('input, textarea').on('keyup blur focus', function (e) {
  var $this = $(this),
      label = $this.prev('label');

      if (e.type === 'keyup') {
            if ($this.val() === '') {
          label.removeClass('active highlight');
        } else {
          label.addClass('active highlight');
        }
    } else if (e.type === 'blur') {
        if( $this.val() === '' ) {
            label.removeClass('active highlight'); 
            } else {
            label.removeClass('highlight');   
            }   
    } else if (e.type === 'focus') {
      
      if( $this.val() === '' ) {
            label.removeClass('highlight'); 
            } 
      else if( $this.val() !== '' ) {
            label.addClass('highlight');
            }
    }
});

function goToUpload() {
    $('#secondary').slideUp('medium');
    $('#main').slideDown('medium');
}

function goToUpdate() {
    $('#main').slideUp('medium');
    $('#secondary').slideDown('medium');
}

/*
 *  After an update request has succeeded, go to "upload view" and populate
 *  the current fields with the existing data in the database.
 *  input: data, a json object representing data inside ddb
 */
function populate(data) {
    goToUpload();
    $('#UpdateUploadKey').show();
    $('#instruct1').hide();
    $('#instruct2').show();
    var names = data.Name.split(" ");
    try{
        if(names[0]){
            document.getElementById('inputFName').value = names[0];
            label = $('#inputFName').prev('label');
            label.addClass('active highlight');
        }
        if(names[1]){
            document.getElementById('inputLName').value = names[1];
            label = $('#inputLName').prev('label');
            label.addClass('active highlight');
        }
        if(data.Email){
            document.getElementById('inputEmail').value = data.Email;
            label = $('#inputEmail').prev('label');
            label.addClass('active highlight');
        }
        if(data["Graduation Year"]){
            document.getElementById('inputGradYear').value = data["Graduation Year"];
            label = $('#inputGradYear').prev('label');
            label.addClass('active highlight');
        }
        if(data.GPA){
            document.getElementById('inputGPA').value = data.GPA;
            label = $('#inputGPA').prev('label');
            label.addClass('active highlight');
        }
        if(data["Primary Major"]){
            document.getElementById('inputPMajor').value = data["Primary Major"];
            label = $('#inputPMajor').prev('label');
            label.addClass('active highlight');
        }
        if(data.UploadKey){
            document.getElementById('inputUploadKey').value = data.UploadKey;
            label = $('#inputUploadKey').prev('label');
            label.addClass('active highlight');
        }
        if(data["Secondary Major"]){
            document.getElementById('inputSMajor').value = data["Secondary Major"];
            label = $('#inputSMajor').prev('label');
            label.addClass('active highlight');
        }
    }
    catch(err){console.log(err);}
}

/*
 * Basic HTTP request sent using ajax using the data inputted into the form.
 * If server returns an error, print error string into the popup window.
 * Else redirect to a "success" page.
 */
function doUpload() {
    $("#progress").show();
    var $progressBar   = $("#progress-bar");
    $progressBar.css({"width": "0%"});
    fd = collectFormData(true);
    for (var i = 0, ie = PENDING_FILES.length; i < ie; i++) {
        fd.append("file", PENDING_FILES[i]);
    }

    fd.append("__ajax", "true");

    var xhr = $.ajax({
        xhr: function() {
            var xhrobj = $.ajaxSettings.xhr();
            if (xhrobj.upload) {
                xhrobj.upload.addEventListener("progress", function(event) {
                    var percent = 0;
                    var position = event.loaded || event.position;
                    var total    = event.total;
                    if (event.lengthComputable) {
                        percent = Math.ceil(position / total * 100);
                    }
                    $progressBar.css({"width": percent + "%"});
                    $progressBar.text(percent + "%");
                }, false)
            }
            return xhrobj;
        },
        url: UPLOAD_URL,
        method: "POST",
        contentType: false,
        processData: false,
        cache: false,
        data: fd,
        success: function(data) {
            $progressBar.css({"width": "100%"});
            data = JSON.parse(data);
            if (data.status === "error") {
                window.alert(data.msg);
                $("#upload-form :input").removeAttr("disabled");
                $('#loader').hide();
                return;
            }
            else {
                currentLoc = window.location.href;
                $('#loader').hide();
                console.log(currentLoc + "/done" + "?uploadkey=" + data.msg);
                window.location.replace(currentLoc + "done?uploadkey=" + data.msg);
                return
            }
        },
    });
}

/*
 * Similar to above, this time for update function.
 * If error raise window, and return error message.
 *
 * Else, go to populate.
 */
function doUpdate() {
    fd = collectFormData(false);
    fd.append("__ajax", "true");

    var xhr = $.ajax({
        url: UPDATE_URL,
        method: "POST",
        contentType: false,
        processData: false,
        cache: false,
        data: fd,
        success: function(data) {
            data = JSON.parse(data);
            if (data.status === "error") {
                window.alert(data.msg);
                $("#upload-form :input").removeAttr("disabled");
                $('#loader').hide();
                return;
            }
            else {
                populate(data.item);
                return

            }
        },
    });
}

/*
 * Self explanatory, populate form into a JSON object
 * input: boolean flag that determines whether the HTML
 * form to populate from is update or upload.
 */
function collectFormData(boolean) {
    var fd = new FormData();
    if(boolean){
        $("#upload-form :input").each(function() {
            var $this = $(this);
            var name  = $this.attr("name");
            var type  = $this.attr("type") || "";
            var value = $this.val();
            if (name === undefined) {
                return;
            }
            if (type === "file") {
                return;
            }
            if (type === "checkbox" || type === "radio") {
                if (!$this.is(":checked")) {
                    return;
                }
            }
            fd.append(name, value);
        });
    } else {
        $("#update-form :input").each(function() {
            var $this = $(this);
            var name  = $this.attr("name");
            var type  = $this.attr("type") || "";
            var value = $this.val();
            if (name === undefined) {
                return;
            }
            if (type === "file") {
                return;
            }
            if (type === "checkbox" || type === "radio") {
                if (!$this.is(":checked")) {
                    return;
                }
            }
            fd.append(name, value);
        });
    }
    return fd;
}

/*
 * Store files in dropbox in a queue.
 *
 */
function handleFiles(files) {
    for (var i = 0, ie = files.length; i < ie; i++) {
        PENDING_FILES.push(files[i]);
    }
}


/*
 * Initialized the drag-drop filebox upload.
 * 
 */
function initDropbox() {
    var $dropbox = $("#dropbox");

    $dropbox.on("dragenter", function(e) {
        e.stopPropagation();
        e.preventDefault();
        $(this).addClass("active");
    });

    // On drag over...
    $dropbox.on("dragover", function(e) {
        e.stopPropagation();
        e.preventDefault();
    });

    // On drop...
    $dropbox.on("drop", function(e) {
        e.preventDefault();
        $(this).removeClass("active");

        // Get the files.
        var files = e.originalEvent.dataTransfer.files;
        handleFiles(files);

        // Update the display to acknowledge the number of pending files.
        $dropbox.text(PENDING_FILES.length + " files ready for upload!");
    });

    // If the files are dropped outside of the drop zone, the browser will
    // redirect to show the files in the window. To avoid that we can prevent
    // the 'drop' event on the document.
    function stopDefault(e) {
        e.stopPropagation();
        e.preventDefault();
    }
    $(document).on("dragenter", stopDefault);
    $(document).on("dragover", stopDefault);
    $(document).on("drop", stopDefault);
}

/*
 * Init/hide slective divs. Handle buttons and on-click events.
 */
$(document).ready(function() {
    $('#loader').hide();
    $('#secondary').hide();
    $('#UpdateUploadKey').hide();
    $("#instruct2").hide();
    initDropbox();

    $("#file-picker").on("change", function() {
        handleFiles(this.files);
    });
    $("#upload-button").on("click", function(e) {
        e.preventDefault();
        $('#loader').show();
        doUpload();
    });

    $("#update-button").on("click", function(e) {
        e.preventDefault();
        doUpdate();
    });

    $("#upload-key").on("click", function(e) {
        goToUpdate();
    });

});
