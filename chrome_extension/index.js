/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * Replace the figury by the iframe.
 * @param   {object}    el  The element where the iframe will be inserted
 * @param   {string}    ascininema_id ID of the asciinema animation
 * @param   {string}    list of parameters with the following format name=value&

 *                      name=value&name=value...
 */
function addOverlay(el, asciinema_id, asciinema_flags) {
  var bbox = el.getBBox(); // The box
  var div = document.createElement("div");
  var svg = document.querySelector(".punch-viewer-svgpage-svgcontainer > svg");

  // Position for the new div
  div.style.left = (bbox.x / svg.viewBox.baseVal.width) * 100 + "%";
  div.style.top = (bbox.y / svg.viewBox.baseVal.height) * 100 + "%";
  div.style.width = (bbox.width / svg.viewBox.baseVal.width) * 100 + "%";
  div.style.height = (bbox.height / svg.viewBox.baseVal.height) * 100 + "%";
  div.style.position = "absolute";
  // Change the aspect
  // I changed the background to transparent. This makes the terminal more
  // consistent with any style or color schema used in the presentation.
  // div.style.background = "rgba(0,0,0,0.6)";
  div.style.background = "transparent"
  div.style.boxSizing = "border-box";
  div.className = "asciinema-element";

  var url = "https://asciinema.org/a/" + asciinema_id + "/embed" + "?" + asciinema_flags ;
  var ifrm = document.createElement("iframe");
  ifrm.setAttribute("src", url);
  ifrm.style.width = "100%";
  ifrm.style.height = "100%";
  ifrm.style.border =  "5px";
  ifrm.style.verticalAlign = "middle";

  div.appendChild(ifrm);

  // Add a reference to the new div
  el._overlay_term = div;
  el.style.background = "#000";

  document.querySelector(".punch-viewer-svgpage").append(div);
}

/**
 * Search for a target figure and parse the ID.
 */
function scanListener() {
  // Search all the squares that have a link
  var terms = document.querySelectorAll(".punch-viewer-svgpage a");

  // For each possible terminal
  terms.forEach(function (term) {
    if (term._skip_term) {
      // No asciinema to add
      return;
    }
    if (term._overlay_term && document.body.contains(term._overlay_term)) {
      // asciinema was drawn
      return;
    }

    // Parse the asciinema link
    // First we split the url to get the parameters out of the url
    var asciinema_url_data = term
      .getAttribute("xlink:href")
      .split("?");

   // Now we process the url to check if it follows the expected format
   var asciinema_canvas = asciinema_url_data[0]
      .match("https://asciinema.org/a/(.+)$");

    // If the parse succeded
    if (asciinema_canvas) {
      var asciinema_id = asciinema_canvas[1];
      asciinema_url_data.shift();
      var asciinema_flags = asciinema_url_data.join("&");
      addOverlay(term, asciinema_id,asciinema_flags);
    } else {
      term._skiip_term = true; // No asciinema to reproduce
    }
  });
}

/* *
 * Setup the listener. It'll check all the time to look for new "targets".
 */
function setupListener() {
  setInterval(scanListener, 100);
  console.log("setupListener", document.URL, document.body);
}

setupListener();
