// PrintLetter for Letter Management - Opens new window with letter html for printing using PagedJS. NOTE: PagedJS may not be fully supported on Firefox (5/2022)
/** Requires three parameters: 
    isLandscape - indicates should be printed in landscape
    fullName - token value for header text
    htmlContent - the content to be printed
**/
// HTML Content and library url
let scriptUrl = "https://unpkg.com/pagedjs/dist/paged.polyfill.js";

//open new window/tab
//ff does not return window object if URL is empty string
var win = window.open("about:blank", "_blank");

var loadLetter = function () {
    //Set page content
    let bottomLeft = `/* Adding image to footer of first page and transforming */
@bottom-left {
    transform: translateY(-.4in);
    content: url("");
}`;

    let sizeReplacements = { "12px": "10pt", "14px": "12pt", "16px": "14pt" };
    let fileTypeReplacements = { ".png": ".svg" };
    // make a combined object for replacement tokens to increase maintainability by separating groups
    let tokenReplacements = Object.assign(sizeReplacements, fileTypeReplacements);
    let re = new RegExp(Object.keys(tokenReplacements).join("|"), "gi");
    win.document.body.innerHTML = htmlContent.replace(re, function (matched) {
        return tokenReplacements[matched];
    });
    win.document.title = "Print Letter";

    // Paged.js config
    win.PagedConfig = {
        auto: true, //auto format on page load, otherwise call
        after: () => {
            win.print();
            win.close();
        }, // Call print dialogue after formatting is complete
    };

    //Find the footer image of the template and hide if there, otherwise don't alter footer on first page
    const images = win.document.getElementsByTagName("img");
    if (images.length != 0) {
        images[images.length - 1].classList.add("hide-image");
    } else {
        bottomLeft = "";
    }

    //Custom styling for printing
    win.document.head.innerHTML = `
<style>
@media screen{
  body{
      display: none;
  }
}
@media print{
  body{
      display: block;
      -webkit-print-color-adjust: exact !important;
      font-family: Arial,"Helvetica Neue",Helvetica,sans-serif;

  }
  @page:first {
      margin-top: .5in;
      margin-bottom: 1.25in;
      @top-right {
          content: "";
      }
      @top-left {
          content:"";
      }
      ${bottomLeft}   
  }  
  @page {
      @top-right {
          content: "Page " counter(page);
          font-size: 8pt;
          font-family: Arial,"Helvetica Neue",Helvetica,sans-serif;
      }
      @top-left {
          content: "${fullName} - Continued";
          font-size: 8pt;
          font-family: Arial,"Helvetica Neue",Helvetica,sans-serif;
      }
      size: letter ${isLandscape == "True" ? `landscape` : ``};
  }
  .page-break{
    page-break-before: always;
    break-before: always;
  }
  li {
    page-break-inside: avoid;
    break-inside: avoid;
    padding: 0;
    margin: 0;
  }
  p{
    padding-bottom: 0px;
    margin-bottom: 0px;
  }
}
 
.hide-image{
  display: none;
}
</style>`;

    //add paged.js script to new window
    const paged = document.createElement("script");
    paged.setAttribute("type", "text/javascript");
    paged.setAttribute("src", scriptUrl);
    win.document.head.appendChild(paged);
};

if (typeof InstallTrigger !== 'undefined') { // isFirefox
    //this may work for FF. See NOTE above.
    win.onload = loadLetter;
} else {
    //chrome, edge, safari
    loadLetter();
}