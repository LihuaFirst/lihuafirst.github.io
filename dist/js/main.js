(function($) {
  "use strict"; // Start of use strict

  /* Smooth scrolling using jQuery easing 
   * Binding an event handler to all anchors that contain a hash (#), but not necessarily JUST a hash - like href="#" which is typically used in JS...
   */

  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
     // Two conditional checks
     // First condition is replacing the first forward slash (/) in the pathname for the current location and comparing it to the link that's been clicked.    
     // Second condition is to see if the link matches the current domain    
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {    
      // this.hash reads the href attribute of this, and gets the part of the URL beginning with #, which is a jquery selector for IDs
      var target = $(this.hash);
      
      // check if the element exist
      // if length equals to 0, query the DOM by name attributes
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      
      // animation  using the target's offset
      // return false prevents default behavior
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 71)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Scroll to top button appear
  $(document).scroll(function() {
    var scrollDistance = $(this).scrollTop();
    if (scrollDistance > 100) {
      $('.scroll-to-top').fadeIn();
    } else {
      $('.scroll-to-top').fadeOut();
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#mainNav',
    offset: 70
  });

  // Collapse Navbar
  var navbarCollapse = function() {
    if ($("#mainNav").offset().top > 100) {
      $("#mainNav").addClass("navbar-shrink");
    } else {
      $("#mainNav").removeClass("navbar-shrink");
    }
  };
  // Collapse now if page is not at top
  navbarCollapse();
  // Collapse the navbar when page is scrolled
  $(window).scroll(navbarCollapse);

  // Floating label headings for the contact form
  $(function() {
    $("body").on("input propertychange", ".floating-label-form-group", function(e) {
      $(this).toggleClass("floating-label-form-group-with-value", !!$(e.target).val());
    }).on("focus", ".floating-label-form-group", function() {
      $(this).addClass("floating-label-form-group-with-focus");
    }).on("blur", ".floating-label-form-group", function() {
      $(this).removeClass("floating-label-form-group-with-focus");
    });
  });

})(jQuery); // End of use strict
