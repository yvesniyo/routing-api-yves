
		var closeButn=document.querySelector(".sidenav__close-icon");
		var menuButton=document.querySelector(".menu-icon");
		var sideNav=document.querySelector(".sidenav");

		function toggleNav(el,className){
			var list=el.classList;
			if(list.contains("active")){
				el.classList.remove("active")
			}else{
				el.classList.add("active")
			}
		}

		closeButn.addEventListener("click",()=>{
			toggleNav(sideNav,"active")
		})
		menuButton.addEventListener("click",()=>{
			toggleNav(sideNav,"active")
		})
		document.querySelector(".profileDrop").addEventListener("click", () => {
            document.querySelector(".drop").style.display = "block";
        })

        function closeDrop() {
            document.querySelector(".drop").style.display = "none";
        }
        var alerts = document.querySelectorAll(".alert")
        for (var i = 0; i < alerts.length; i++) {
            alerts[i].addEventListener("click", (el) => {
                console.log(el.target.parentElement)
                // el.target.parentElement.classList.add("remove");
                // el.target.parentElement.classList.remove("some")
                // if (document.querySelectorAll(".alerts .some").length == 0) {
                //     document.querySelector(".main-header_update").style.display = "none";
                // }
            })

        }

        function arrange() {
            if (!document.querySelector(".alerts .some")) {
                document.querySelector(".main-header_update").style.display = "none";
            }
        }

        setInterval(() => {
            if (localStorage.getItem("lastRefresh") == null) {
                localStorage.setItem("lastRefresh", new Date().getTime());
            }
            var lastTimeLefresh = localStorage.getItem("lastRefresh");
            var now = new Date().getTime();
            if ((now - lastTimeLefresh) >= 1000 * 10) {
                $.ajax({
                    url: '/refresh',
                    method: "GET",
                    success: function(data) {
                        // console.log(data)
                        localStorage.setItem("lastRefresh", new Date().getTime());
                        if (data.status == "error") {
                            $(".login").css("display", "block");
                        } else {
                            $(".login").css("display", "none");
                        }
                    }
                })

            }
        }, 100)
        $(".login").click(function() {
            document.location.href = "/logout";
        })

        $("#resendLink").on("click",function(){
            var email = $("#emailContainer").val();
            $.ajax({
                url:'/userAuth/resendEmail',
                method:'get',
                data:{email: email},
                success:function(data){
                    console.log(data);
                    $("#resendLink").text("Send Success!!!");
                    $("#resendLink").css("color","blue");
                },
                error:function(error){
                    console.log(error);
                    $("#resendLink").html("Resending Failed check if your email is correct in Profile.and try again later");
                }
            })
        })

