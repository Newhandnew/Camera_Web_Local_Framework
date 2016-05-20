/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

var videoElement = document.querySelector('video');
var videoSelect = document.querySelector('select#videoSource');

function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  while (videoSelect.firstChild) {
    select.removeChild(select.firstChild);
  }
  for (var i = 0; i !== deviceInfos.length; ++i) {
    var deviceInfo = deviceInfos[i];
    var option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source/device: ', deviceInfo);
    }
  }
  if (Array.prototype.slice.call(videoSelect.childNodes).some(function(n) {
    return n.value === values[videoSelect];
  })) {
    videoSelect.value = values[videoSelect];
  }
}

navigator.mediaDevices.enumerateDevices()
.then(gotDevices)
.catch(errorCallback);

function errorCallback(error) {
  console.log('navigator.getUserMedia error: ', error);
}

function start() {
  if (window.stream) {
    window.stream.getTracks().forEach(function(track) {
      track.stop();
    });
  }
  var videoSource = videoSelect.value;
  var constraints = {
    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
  };
  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(stream) {
    window.stream = stream; // make stream available to console
    videoElement.srcObject = stream;
    // Refresh button list in case labels have become available
    return navigator.mediaDevices.enumerateDevices();
  })
  .then(gotDevices)
  .catch(errorCallback);
}

var canvas = window.canvas = document.querySelector('canvas');
canvas.width = 480;
canvas.height = 360;

var button = document.querySelector('#btn_takeSnap');
button.onclick = function() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  var dataURL = canvas.toDataURL();
  $.ajax({
    type: "POST",
    url: "/camera",
    data: {
      base64img: dataURL
    },
    success: function(resp){
      var pending_hash = resp.sha256sum;
      var status_elem = document.getElementById("caption");
      status_elem.style.color='yellow';
      status_elem.innerText = "waiting for the captioning of the image...";
      var checkTimer = setInterval(function(){
        var r = new XMLHttpRequest();
        r.open("GET", "/caption/"+pending_hash);
        r.onreadystatechange = function () {
          if (r.readyState != 4){
            status_elem.style.color='red';
            status_elem.innerText="ERROR REQUESTING CAPTION STATUS!";
          }
          else{
            status_elem.style.color='green';
            status_elem.innerText=r.responseText;
          }
        };
        r.send();
      },2000);
    }
  })
};

videoSelect.onchange = start;

start();
