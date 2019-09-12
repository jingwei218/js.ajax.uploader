(function ($) {

    $.fn.ajaxFileUploader = function (options) {

        var opts = $.extend({}, $.fn.ajaxFileUploader.defaults, options);

        var files = [];
        var valid_files = [];
        var jqXHR;

        var dropzone = document.getElementById(opts.dropzoneId),
            fileList = document.getElementById(opts.fileListId),
            upFileList = document.getElementById(opts.uploadedFileListId),
            buttonUpload = document.getElementById(opts.buttonUploadId),
            buttonReset = document.getElementById(opts.buttonResetId);

        $(dropzone).on("dragover", function (e) {
            e.preventDefault();
        }).on("dragleave", function (e) {
            e.preventDefault();
        }).on("drop", function (e) {
            e.preventDefault();
            clearFileList();
            var dataTransfer = e.originalEvent.dataTransfer;
            if (dataTransfer.items) {
                for (var i = 0; i < Math.min(opts.filesLimit, dataTransfer.items.length); i++) {
                    if (dataTransfer.items[i].kind === 'file') {
                        var file = dataTransfer.items[i].getAsFile();
                        files.push(file);
                    }
                }
            } else {
                for (var i = 0; i < Math.min(opts.filesLimit, dataTransfer.files.length); i++) {
                    var file = e.dataTransfer.files[i];
                    files.push(file);
                }
            }

            attachFiles(opts);
        });

        $(buttonUpload).click(function (e) {
            uploadFiles(opts);
        });

        $(buttonReset).click(function (e) {
            clearFileList();
            if (jqXHR) {
                jqXHR.abort();
            }
        });

        $(fileList).click(function (e) {
            var el = e.target;
            if ($(el).parents('button.close').hasClass('close')) {
                var arr = $(fileList).find('li').toArray();
                var li = $(el).parents('li').get(0);
                var fi = arr.indexOf(li);
                removeFile(fi);
            }
            if (valid_files.length == 0) {
                buttonUpload.disabled = true;
                buttonReset.disabled = true;
            }
        });

        function attachFiles(opts) {
            var acceptExt = opts.acceptExt.replace(/ /g, '').split(',');
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var file_name_frac = file.name.split('.');
                var file_ext = file_name_frac[file_name_frac.length - 1];
                if ((file.size <= opts.fileSizeLimit) && (acceptExt.indexOf(file_ext) > -1)) {
                    valid_files.push(file);
                    var html = '<li class="list-group-item">\
                                    <div class="d-flex justify-content-start align-items-center fw">\
                                        <div class="d-inline-flex mr-2 fname">' + file.name + '</div>\
                                        <button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>\
                                        <div class="progress w-0 mr-2"><div class="progress-bar" role="progressbar" style="width: 0%"></div></div>\
                                    </div>\
                                </li>';
                    $(html).appendTo(fileList);
                }
            }
            buttonUpload.disabled = false;
            buttonReset.disabled = false;
        }

        function uploadFiles(opts) {
            for (var i = 0; i < valid_files.length; i++) {
                var file = valid_files[i];
                var progressbar = $('.progress-bar').get(i);
                var spinner = $('<div class="spinner-border spinner-border-sm flex-shrink-0" role="status"></div>');
                var loadcheck = $('<i class="fas fa-check fa-fw fa-1x"></i>');
                var formData = new FormData();
                formData.append('file', file);
                jqXHR = $.ajax({
                    url: opts.url,
                    type: 'POST',
                    xhr: function () {
                        var xhr = $.ajaxSettings.xhr();
                        var upload = xhr.upload;
                        upload.progressbar = progressbar;
                        upload.spinner = spinner;
                        upload.loadcheck = loadcheck;
                        upload.addEventListener('loadstart', function (e) {
                            uploadStart(e, i);
                        });
                        upload.addEventListener('progress', function (e) {
                            uploadProgress(e, i);
                        });
                        upload.addEventListener('load', function (e) {
                            uploadComplete(e, i);
                        });
                        return xhr;
                    },
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                }).done(function (ajax_rsp) {
                    appendUploadedFile(ajax_rsp.file_name, ajax_rsp.url);
                });
            }
        }

        function uploadStart(e, i) {
            $(fileList).find('button.close').remove();
            $(fileList).find('div.progress').removeClass('w-0').addClass('w-75');
            var fw = $(fileList).find('.fw').eq(i);
            fw.append(e.target.spinner);
            buttonUpload.disabled = true;
        }

        function uploadProgress(e, i) {
            var progressbar = e.target.progressbar;
            if (e.lengthComputable) {
                var percentage = Math.round((e.loaded * 100) / e.total);
                $(progressbar).width(percentage.toString() + '%');
            }
        }

        function uploadComplete(e, i) {
            $(e.target.spinner).replaceWith(e.target.loadcheck);
            buttonUpload.disabled = true;
        }

        function clearFileList() {
            $(fileList).html('');
            files.length = 0;
            valid_files.length = 0;
            buttonUpload.disabled = true;
            buttonReset.disabled = true;
        }

        function removeFile(i) {
            valid_files.splice(i, 1);
            $(fileList).find('li').eq(i).remove();
        }

        function appendUploadedFile(file_name, url) {
            var li = $('<li><a href="' + url + file_name + '">' + file_name + '</a></li>');
            $(upFileList).append(li);
        }
    };

    $.fn.ajaxFileUploader.defaults = {
        url: '',
        fileSizeLimit: 20 * 1024 * 1024,
        filesLimit: 1,
        acceptExt: 'xlsx, xls',
        dropzoneId: 'drop-zone',
        buttonUploadId: 'btn-upload',
        buttonResetId: 'btn-reset',
        fileListId: 'file-list',
        uploadedFileListId: 'up-file-list',
    };

}(jQuery));