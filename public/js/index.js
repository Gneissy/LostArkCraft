
// Loading screen
$(window).on("load",function(){
  $(".loader-wrapper").fadeOut("slow");
});

// If user clicks the button, toggle betweel hiding and showing the dropdown content
function toggleTradeItems() {
  document.getElementById("tradeDropdown").classList.toggle("show");
}

// If user clicks the button, toggle betweel hiding and showing the dropdown content
function toggleBattleItems() {
  document.getElementById("battleDropdown").classList.toggle("show");
}

// Open and Close dropdown menu by clicking
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
