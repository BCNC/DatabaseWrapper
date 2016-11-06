
var MAX_UPLOAD_FILE_SIZE = 25*1024*1024; // 25 MB
var UPLOAD_URL = "/upload";
var UPDATE_URL = "/update";
var NEXT_URL   = "/files/";

var PENDING_FILES  = [];

function stringify(obj)
{
    var temp;
    temp = JSON.flatten(obj);
    var string = "";
    for (var ke in temp) {
           if (temp.hasOwnProperty(ke)) {
                string += temp[ke];
           }
    } 
    return string;
}

function grabnextphrase(string,n,skip)
{
    var left = -1;
    var right = 0;
    while(true){
        if(string[n + right] == " " && left == -1){
            left = right;
            right++;
        }
        else if(string[n + right] == " " && left != -1)
            break;
        else
            right++;
    }
    var returnString = string.substring(n + left, n + right);
    if(returnString.length >= skip)
        return returnString;
    else{
        return returnString + grabnextphrase(string,n + right,skip);
    }
}

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

function populate(data) {

    goToUpload();
    $('#UpdateUploadKey').show();
    $('#instruct1').hide();
    $('#instruct2').show();
    console.log(typeof data);
    var names = data.Name.split(" ");
    //phone
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


function doUpload() {
    $("#progress").show();
    var $progressBar   = $("#progress-bar");
    $progressBar.css({"width": "0%"});
    fd = collectFormData(true);
    for (var i = 0, ie = PENDING_FILES.length; i < ie; i++) {
        fd.append("file", PENDING_FILES[i]);
    }

    // Inform the back-end that we're doing this over ajax.
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

                    // Set the progress bar.
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
                        console.log(data);

            data = JSON.parse(data);
            console.log(data);
            if (data.status === "error") {
                window.alert(data.msg);
                $("#upload-form :input").removeAttr("disabled");
                $('#loader').hide();
                return;
            }
            else {

                window.alert(data.msg);
                $('#loader').hide();
                return

            }
        },
    });
}

function doUpdate() {
    fd = collectFormData(false);
    // Inform the back-end that we're doing this over ajax.
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
            console.log(data);
            if (data.status === "error") {
                window.alert(data.msg);
                $("#upload-form :input").removeAttr("disabled");
                $('#loader').hide();
                return;
            }
            else {
                console.log("Hello David population can now begin");
                console.log(data.item);
                populate(data.item);
                return

            }
        },
    });
}


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


function handleFiles(files) {
    // Add them to the pending files list.
    for (var i = 0, ie = files.length; i < ie; i++) {
        PENDING_FILES.push(files[i]);
    }
}


function initDropbox() {
    var $dropbox = $("#dropbox");

    // On drag enter...
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


JSON.flatten = function(data) {
    var result = {};
    function recurse (cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
             for(var i=0, l=cur.length; i<l; i++)
                 recurse(cur[i], prop ? prop+"."+i : ""+i);
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop+"."+p : p);
            }
            if (isEmpty)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
}


function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

$(document).ready(function() {
    $('#phase2').hide();
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
    $("#done-button").on("click", function(e) {
        e.preventDefault();
        window.location="/done";
    });
    $("#upload-key").on("click", function(e) {
        goToUpdate();
    });

});
