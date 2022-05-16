//Hide VV's close button:  
$("[class='CloseContainer']").hide();

//Change color of VV Form close buttons (1 for each close button) and close button to work even in Read Only:
$("[vvfieldname='btnClose1']").css("background-color", "#D50000").css("color", "#000").removeAttr('disabled').removeAttr('readonly');
$("[vvfieldname='btnClose']").css("background-color", "#D50000").css("color", "#000").removeAttr('disabled').removeAttr('readonly');