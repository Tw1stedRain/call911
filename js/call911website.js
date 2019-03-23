/**
 * http://usejsdoc.org/
 */
var myUrl = "https://call911.us/rtc/"
var signupvalid = false;
var localpsk    = null;
var orderpsk    = null;
var loggedin    = false;
var partialrecordjson = null;
var loginpsk    = null;
var messagingcenters = null;
var user = null;
var callList = null;

$(document).ready(function(){

	 gpio_socket = io.connect('http://localhost:8081');

   if (typeof(Storage) !== "undefined") {
	        if (( localStorage.getItem("psk") !== null ) && ( localStorage.getItem("psk") !== undefined)) {
	            localpsk = localStorage.getItem("psk");
	            console.log("localpsk:" + localpsk);
	        }
	 }

	$("#btn-buy-top").click( function(){
		buy();
	});

	$("#btn-order").click( function(){
		$("#order_message_center").css( "display","none");
        $('#number_section').css("display","block");
		orderItem();
	});

	$("#btn-submit-address").click( function(){
		submitAddress();
	});

	$("#btn-buy").click( function(){
		buy();
	});

	$("#btn-logon").click( function() {
		$('#mainbody').css("display","none");
		$("#headdiv").css( "display","none");
		$('#profile_section').css("display","none");
		$('#login_section').css("display", "block");
		$("#signup_section").css( "display","none");
	});

	$("#btn-login").click( function() {
		login();
	});

	$("#messagingCenter").change( function(){

		getUser();
	});


	$("#btn-addaccount").click( function(){
       if(signupvalid)
       {
    	addAccount();

       }
	});

	$("#sign_me_up_btn").click( function(){
	       if(signupvalid)
	       {
	    	$("#stripe_div").css("display", "block");

	       }
		});

	$("#explore_by_ac").click( function() {
		getNumsAvail($("#ac").val());

	});

	$("#explore_by_zip").click( function() {
		getNumsAvail($("#zip").val());

	});

	$("#btn-add-friend").click( function() {
		addToAndRefreshFriendList();
	});


	$("#make_it_minde_button").click( function() {
        $('#number_section').css("display","none");
        $('#signup_section').css("display", "none");
    });

    $("#make_it_mine_button").click( function() {
		 addSmsToAccount();
		getShippingInformation();
	});

	$("#btn-home").click( function(){
		$("#headdiv").css( "display","block");
		$("#mainbody").css( "display","flex");
		$("#signup_section").css( "display","none");
		$("#number_section").css( "display","none");
		$("#review_and_pay_section").css( "display","none");
		$('#profile_section').css("display","none");
		$('#login_section').css("display","none");
	});

    $("#homePhoneMoreLink").click( function(){
	if( $("#homePhoneMoreContent").css( "display") == "none" )
    {
      $("#homePhoneMoreContent").css( "display","block");
    }else{
      $("#homePhoneMoreContent").css( "display","none");
    }
	});

	$("#cellPhoneMoreLink").click( function(){
		if( $("#cellPhoneMoreContent").css( "display") == "none" )
	    {
	      $("#cellPhoneMoreContent").css( "display","block");
	    }else{
	      $("#cellPhoneMoreContent").css( "display","none");
	    }
	});

    $('#signup_email').on('blur', function() {
        validateEmail($('#signup_email').val());
    });
});

function showProfile()
{
	$("#headdiv").css( "display","none");
	$("#mainbody").css( "display","none");
	$("#signup_section").css( "display","none");
	$("#number_section").css( "display","none");
	$("#review_and_pay_section").css( "display","none");
	$('#profile_section').css("display","block");
	$('#login_section').css("display","none")
	getMessagingCenters();
}



function buy()
{
  console.log("a Buy button was clicked");
  $("#headdiv").css( "display","none");
  $("#mainbody").css( "display","none");
  $('#profile_section').css("display","none");
  $('#login_section').css("display","none");
  if(loggedin){
	  $('#order_message_center').css("display","block");
  }
  else
  {
	  $("#signup_section").css( "display","block");
  }
}


function reviewOrder( val )
{
let myData = {"orderpsk":orderpsk, "addressid":val}

console.log("update order:" + JSON.stringify(myData));
getPartialRecord();
}

function displayItems(){
    let myData = {"itemid":1}
    var request = $.ajax({
        url: myUrl + "getcatalogitem",
        data: myData,
        type: "POST",
        dataType : "json",
        success: function( json ) {
            console.log("success!");
            $("#item_name").html(json.NAME);
            $('#item_image').attr('src',json.IMGURL);
            $("#item_description").html(json.DESCRIPTION);
            $("#item_price").html('$'+ json.PRICE);
        },
        error: function( xhr, status, errorThrown ) {
            //alert( "Sorry, there was a problem!" );
            console.log( "error! " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        },
        complete: function( xhr, status ) {
            console.log("complete!");
        	$('#order_message_center').css("display","block");
            $('#signup_section').css("display", "none");
        }
    });
}

function validateEmail(val)
{
    var myData = {
      "email":val
    };


   var request = $.ajax({
        url: myUrl + "emailvalidate",
        data: myData,
        type: "POST",
        dataType : "json",
        success: function( json ) {
            console.log("success!");
            if(json.valid) {
                console.log(myData.email + " is a valid email address.");
                $('#signup_email_label').html("eMail address");
                signupvalid = true;
                $('#signup_password1').focus();
            }
            else {
                $('#signup_email_label').html("<span style='color:red;'>Email Seems Invalid. Correct or use alternate.</span>");
                signupvalid = false;
            }
        },
        error: function( xhr, status, errorThrown ) {
            //alert( "Sorry, there was a problem!" );
            console.log( "error! " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        },
        complete: function( xhr, status ) {
            console.log("complete!");
        }
    });

}


function  addAccount(){

    var myName =  $('#signup_name').val();
    if(signupvalid) {

        $.ajax({
            url: myUrl + "addaccount",

            data: {
                password: $('#signup_password2').val(),
                email:    $('#signup_email').val(),
                mname:    $('#signup_name').val(),
                number:   $("#numbers").data("textable")
            },

            type: "POST",

            dataType: "json",

            success: function (json) {
                if ((json.psk === null || json.psk === undefined || json.psk.length < 10 ? false : true)) {
                    psk = json.psk;
                    if (typeof(Storage) !== "undefined") {
                        localStorage.setItem("psk", psk);
                        localpsk = psk;
                        console.log("psk now in localStorage as psk");
                    } else {
                        console.log("No localStorage");
                    }
                } else {
                    alert("something went wrong. try again.");
                }
            },

            error: function (xhr, status, errorThrown) {
                alert("Sorry, there was a problem!");
                console.log("Error: " + errorThrown);
                console.log("Status: " + status);
                console.dir(xhr);
            },

            complete: function (xhr, status) {
                $('#logon_email').val($('#signup_email').val());
                if ((psk === null || psk === undefined || psk.length < 10 ? false : true)) {
                    $("#paypaldiv input[name=custom]").val(psk);
                    $('#sign_me_up_btn').addClass('not-visible');
                    $('#pay_div').removeClass("not-visible");
                    $('#pay_div').addClass("is-visible");
                      displayItems();
                    //getNumsAvail(206);

                }
                else {
                    alert("Something went wrong. Try the Sign Up! button again.");
                }
            }
        });

    }
    else
    {
        alert("Please correct the form as indicated before submitting.");
    }
}

function  addSmsToAccount(){

	let twilionumber = $("#numbers").data("textable");

	let myData = { text:   "call911.us",
                   psk:    orderpsk,
                   number: twilionumber
        };

	console.log("myData:" + JSON.stringify(myData) );

	var request = $.ajax({
        url: myUrl + "addsmstoaccount",
        data: myData,
        type: "POST",
        dataType : "json",
        success: function( json ) {
            console.log("success!");
            if(json.valid) {
                console.log("json:" + JSON.stringify(json));
            }
            else {
                //$('#signup_email_label').html("<span style='color:red;'>Email Seems Invalid. Correct or use alternate.</span>");
                //signupvalid = false;
            }
        },
        error: function( xhr, status, errorThrown ) {
            //alert( "Sorry, there was a problem!" );
            console.log( "error! " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        },
        complete: function( xhr, status ) {
            console.log("complete!");
            //getPartialRecord();

        }
    });

	/*
    if(localpsk !== null) {
        var request = $.ajax({
            url: myUrl + "addsmstoaccount",
            data: {
                text:   "call911.us",
                psk:    localpsk,
                number: twilionumber
            },
            type: "POST",
            dataType: "json",
            success: function (json) {
                console.log("addSmsToAccount result:" + JSON.stringify(json));
            },
            error: function (xhr, status, errorThrown) {
                alert("Sorry, there was a problem!");
                console.log("Error: " + errorThrown);
                console.log("Status: " + status);
                console.dir(xhr);
            },
            complete: function (xhr, status) {
            	$("#number_section").css( "display","none");
        		$("#pay_section").css( "display","block");

                $('#logon_email').val($('#signup_email').val());
                if ((psk === null || psk === undefined || psk.length < 10 ? false : true)) {
                    $("#paypaldiv input[name=custom]").val(psk);
                    $('#sign_me_up_btn').addClass('not-visible');
                    $('#pay_div').removeClass("not-visible");
                    $('#pay_div').addClass("is-visible");
                    $('#number_section').css("display","block");
                    $('#signup_section').css("display", "none");
                    getNumsAvail(206);

                }
                else {
                    alert("Something went wrong. Try the Sign Up! button again.");
                }

            }
        });

    }
    else
    {
        alert("Please correct the form as indicated before submitting.");
    }
*/

}

function getShippingInformation(){
	 $("#number_section").css( "display","none");
	 $("#shipping_info_section").css( "display","block");
}


function  getPartialRecord(){

    if(localpsk !== null) {

        $.ajax({
            url: myUrl + "getpartialrecord",

            data: {
                "psk":localpsk
            },

            type: "POST",

            dataType: "json",

            success: function (json) {
            	partialrecordjson = json
                if(json.valid){
            	console.log("valid json getpartialrecord:" + JSON.stringify(json));
                } else {
                	console.log("invalid json getpartialrecord:" + JSON.stringify(json));
                }
            },

            error: function (xhr, status, errorThrown) {
                alert("Sorry, there was a problem!");
                console.log("Error: " + errorThrown);
                console.log("Status: " + status);
                console.dir(xhr);
            },

            complete: function (xhr, status) {
                    $('#name').html(partialrecordjson.NAME);
                    $('#textable').html(partialrecordjson.NUMBER);
                    $('#email').html(partialrecordjson.EMAIL);
                    $('#number_section').css("display","none");
                    $('#signup_section').css("display", "none");
                    $('#shipping_info_section').css("display", "none");
                    $('#review_and_pay_section').css("display", "block");

            }
        });

    }
    else
    {
        alert("Please correct the form as indicated before submitting.");
    }
}

function  orderItem(){

	if(localpsk !== null) {
        let myData = {"userpsk":localpsk,
    				  "orderpsk":orderpsk,
    	              "itemid":1}
    	$.ajax({
            url: myUrl + "orderin",
            data: myData,
            type: "POST",
            dataType: "json",
            success: function (json) {
            	partialrecordjson = json
            	orderpsk = json.ORDERPSK;
                if(json.valid){
            	console.log("orderin orderpsk:" + JSON.stringify(json));
                } else {
                	console.log("invalid json orderin:" + JSON.stringify(json));
                	orderpsk = json.ORDERPSK;
                }
            },
            error: function (xhr, status, errorThrown) {
                alert("Sorry, there was a problem!");
                console.log("Error: " + errorThrown);
                console.log("Status: " + status);
                console.dir(xhr);
            },
            complete: function (xhr, status) {
            }
        });
    }
    else
    {
        alert("Please correct the form as indicated before submitting.");
    }
}

function  login(){
	let username = $('#login_username').val();
	let password = $('#login_password').val();

	if(loginpsk == null) {
        let myData = {"username":username,
    				  "password":password
    	              }
    	$.ajax({
            url: myUrl + "loginsimple",
            data: myData,
            type: "POST",
            dataType: "json",
            success: function (json) {
            	if(json.responsecode == 1)
                {
            	  loginpsk = json.psk;
            	}

            	if(json.valid){
            	  console.log("simplelogin:" + JSON.stringify(json));
                } else {
                	console.log("invalid json simplelogin:" + JSON.stringify(json));
                }
            },
            error: function (xhr, status, errorThrown) {
                alert("Sorry, there was a problem!");
                console.log("Error: " + errorThrown);
                console.log("Status: " + status);
                console.dir(xhr);
            },
            complete: function (xhr, status) {
            	if(loginpsk !== null)
            	{
            		showProfile();
            	}
            }
        });
    }
    else
    {
        alert("Please correct the form as indicated before submitting.");
    }
}



function  submitAddress(){
    if(localpsk !== null) {

    	let myData = { "address1":$('#inputAddress').val(),
    				   "address2":$('#inputAddress2').val(),
    	               "city":$('#inputCity').val(),
    	               "state":$('#inputState').val(),
    	               "zip":$('#inputZip').val(),
    	               "lat":null,
    	               "lng":null,
    	               "perid":null,
    	               "actid":null,
    	               "gps":0,
    	               "type":1,
    	               "orderpsk":orderpsk,
    	               "note":$('#inputNote').val()
                    };
    	$.ajax({
            url: myUrl + "addaddress",
            data: myData,
            type: "POST",
            dataType: "json",
            success: function (json) {
            	partialrecordjson = json
            	reviewOrder(json.LASTINSERT);
            	if(json.valid){
            	console.log("addaddress:" + JSON.stringify(json));
                } else {
                	console.log("invalid json getpartialrecord:" + JSON.stringify(json));

                }
            },
            error: function (xhr, status, errorThrown) {
                alert("Sorry, there was a problem!");
                console.log("Error: " + errorThrown);
                console.log("Status: " + status);
                console.dir(xhr);
            },
            complete: function (xhr, status) {

            }
        });
    }
    else
    {
        alert("Please correct the form as indicated before submitting.");
    }
}



function  getUser(){
    let smsnumber = $("#messagingCenter").val();

	$.ajax({
     url: myUrl + "getuserforsmsnum",

     data: {
         smsnumber:smsnumber
     },

     type: "POST",

     dataType : "json",

     success: function( json ) {
         user = json;
     },

     error: function( xhr, status, errorThrown ) {
         alert( "Sorry, there was a problem!" );
         console.log( "Error: " + errorThrown );
         console.log( "Status: " + status );
         console.dir( xhr );
     },

     complete: function( xhr, status ) {
         var html = "";
         $("#user_name").val(user.NAME);
         $("#user_email").val(user.EMAIL);

     }
});
}



function  getMessagingCenters(){
       $.ajax({
        url: myUrl + "getmessagingcenters",

        data: {
            loginpsk:loginpsk
        },

        type: "POST",

        dataType : "json",

        success: function( json ) {
            messagingcenters = json;
        },

        error: function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        },

        complete: function( xhr, status ) {
            var html = "";

            if (messagingcenters.length > 0) {

                messagingcenters.forEach(function (val) {
                    html += '<option value="' + val.did + '">' + val.did + '</option>';
                });

                $("#messagingCenter").html(html);
        }
        }
});
}



function addToAndRefreshFriendList(){
	myData = {
        phone:$("#inputPhoneOrTextNumber").val(),
        name: $("#inputPhoneOrTextName").val(),
        textable:1,
        user: $("#messagingCenter").val()
    },
	$.ajax({
        url: myUrl + "addfriendphone",
        data: myData,
        type: "POST",
        dataType : "json",
        success: function( json ) {
            callList = json;
        },
        error: function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        },
        complete: function( xhr, status ) {
            var html = "";
        if (callList.length > 0) {

                callList.forEach(function (val) {
                    html += '<option value="' + val.NUMBER + '">' + val.NAME + '</option>';
                });

                $("#phoneList").html(html);
                $("#inputPhoneOrTextNumber").val("");
                $("#inputPhoneOrTextName").val("");
        }
        }
});







}

function  getNumsAvail(val){
    var area = '213';
    var zip  = '92262';
    var numbers = [];
    var textable = "";

    if(val.toString().length == 3) {
       area = val.toString();
       zip = "";
       $("#zip").val(zip);
    }

    if(val.toString().length == 5) {
        zip = val.toString();
        area = "";
        $("#ac").val(area);
    }

    console.log("zip: " + zip);
    console.log("area"  + area);

    $.ajax({
        url: myUrl + "getavailnums",

        data: {
            psk:      psk,
            area:     area,
            zip:      zip
        },

        type: "POST",

        dataType : "json",

        success: function( json ) {
            console.log("getNumsAvail(" + val + ") results: " + JSON.stringify(json));
            numbers = json;
        },

        error: function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        },

        complete: function( xhr, status ) {
            var html = "";

            if (numbers.length > 0) {

                numbers.forEach(function (val) {
                    html += '<li class="list-group-item" data-number="' + val.value + '"><a href="#">' + val.text + '</a></li>';
                });

                $("#numbers").html(html);

                $('#numbers li a').on('click', function () {

                    var human    = $(this).html();
                    var textable = $(this).parent().data("number")

                    $("#make_it_mine").val(human);
                    $("#textable").html(human);

                    $("#numbers").data("human", human);
                    $("#numbers").data("textable", textable);

                    console.log("numbers click human: " + human);
                    console.log("numbers click textable: " + textable);
                });
            }


            /*console.log("top #tonums li:" + $("#tonums a:first-child").html());

            if($("#to_number").val() == "")
            {
                $("#to_number").val($("#tonums a:first-child").html());
            }

            getMessages( $("#to_number").val());*/

            if(zip.length == 5)
            {
                if (numbers.length > 0) {
                    $('#num_avail_results').html('<p>The <a href="#numbers">Textable Numbers</a> section is displaying ' + numbers.length + " numbers in the " + zip + " Zip Code.</p><p>Choose a number by clicking on it or click <strong>Go!</strong> again.</p>");
                    $('#ul_available').html('Textable Number Available in the ' + zip + ' Zip Code.');
                }
                else
                {
                    $('#num_avail_results').html("<p>Sorry! There are currently no numbers available in the " + zip + " Zip Code.</p>");
                }
            }
            else if (area.length == 3)
            {
                if (numbers.length > 0) {
                    $('#num_avail_results').html('<p>The <a href="#numbers">Textable Numbers</a> section is displaying ' + numbers.length + " numbers in the " + area + " Area Code.</p><p>Choose a number by clicking on it or click <strong>Go!</strong> again.</p>");
                    $('#ul_available').html('Textable Numbers Available in the ' + area + ' Area Code.');
                }
                else
                {
                    $('#num_avail_results').html("<p>Sorry! There are currently no numbers available in the " + area + " Area Code.</p>");
                }
            }

            $('#make_it_mine').val( $("#numbers li:first-child a").html());
            $("#numbers").data("human", $("#numbers li:first-child a").html());
            $("#numbers").data("textable", $("#numbers li:first-child").data("number"));

            console.log("getNumsAvail() complete.");
        }
    });
}
