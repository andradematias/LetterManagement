/** Requires three parameters: 
    isLandscape - indicates should be printed in landscape
    fullName - token value for header text
    htmlContent - the content to be printed
**/
// HTML Content and library url

let scriptUrl = "https://unpkg.com/pagedjs/dist/paged.polyfill.js";

//open new window/tab
let win = window.open('', '_blank');

//Set page content
let bottomLeft = `/* Adding image to footer of first page and transforming */
@bottom-left {
    transform: scale(.85) translateX(-.75in) translateY(-.5in);
    content: url("https://vv5sandbox.visualvault.com/imagehandler.ashx?xcid=1b9782e5-c48c-eb11-81f9-dc23f34e190a&xcdid=430b9745-2fa5-eb11-81fa-ebd64477ffbf&hidemenu=true&DhID=bf2ad66b-7bf4-eb11-a9ce-81da4fd2f38e");
}`

let replacementSizes = { '12px': '10pt', '14px': '12pt', '16px': '14pt' };
let re = new RegExp(Object.keys(replacementSizes).join("|"), "gi");
win.document.body.innerHTML = htmlContent.replace(re, function (matched) {
    return replacementSizes[matched];
});
win.document.title = 'Print Letter';

// Paged.js config
win.PagedConfig = {
    auto: true, //auto format on page load, otherwise call 
    after: () => { win.print(); win.close(); }, // Call print dialogue after formatting is complete
};

//Find the footer image of the template and hide if there, otherwise don't alter footer on first page
let images = win.document.getElementsByTagName('img');
if (images.length != 0) {
    images[images.length - 1].classList.add('hide-image');
} else {
    bottomLeft = '';
}


//Custom styling for printing
win.document.head.innerHTML = `
<style>

@media screen{
    body{
        display: none
    }
  }
  
@media print{
    body{
        display: block;
        -webkit-print-color-adjust: exact !important;
        font-family: Arial,"Helvetica Neue",Helvetica,sans-serif;
    }
    .page-break{
        page-break-before: always;
    }
}

@page :first {
    @top-right {
        content: "";
    }
    @top-left {
        content:"";
    }
    ${bottomLeft}   
}

@page :first {
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
    size: letter ${isLandscape == 'True' ? `landscape` : ``};
    margin-top: .75in;
    margin-bottom: .75in;
    margin-right: .75in;
    margin-left: .75in;   
}

li{
  break-inside: avoid;
}

.hide-image{
    display: none;
}
<\/style>`;


//add paged.js script to new window
let paged = document.createElement('script');
paged.setAttribute('type', 'text/javascript')
paged.setAttribute('src', scriptUrl);
win.document.head.appendChild(paged);
