$(function() {

    'use strict';
  
    $(document).ready(function(){
      $('.sidenav').sidenav();
    });
  
    $(document).ready(function () {
      var swiper = new Swiper ('.swiper-home', {
        loop: false,
        slidesPerView: "auto",
        spaceBetween: 20,
      })
    });
  
    $(document).ready(function () {
      var swiper = new Swiper(".swiper-search", {
        slidesPerView: 2,
        spaceBetween: 30,
        freeMode: true,
      })
    });
  
    $(document).ready(function () {
      $('.tabs').tabs();
    });
    
  });