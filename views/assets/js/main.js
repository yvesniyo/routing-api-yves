
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