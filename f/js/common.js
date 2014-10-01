 function is_touch_device() {
   return !!('ontouchstart' in window) || !!('onmsgesturechange' in window);
 }

 function metrikaReach(goal_name, goal_params) {
   var goal_params = goal_params || {};
   for (var i in window) {
     if (/^yaCounter\d+/.test(i)) {
       window[i].reachGoal(goal_name, goal_params);
     }
   }
 }

 ;
 (function(window, document, $) {

   var isInputSupported = 'placeholder' in document.createElement('input'),
     isTextareaSupported = 'placeholder' in document.createElement('textarea'),
     prototype = $.fn,
     valHooks = $.valHooks,
     hooks,
     placeholder;

   if (isInputSupported && isTextareaSupported) {

     placeholder = prototype.placeholder = function() {
       return this;
     };

     placeholder.input = placeholder.textarea = true;

   } else {

     placeholder = prototype.placeholder = function() {
       var $this = this;
       $this
         .filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
         .not('.placeholder')
         .bind({
           'focus.placeholder': clearPlaceholder,
           'blur.placeholder': setPlaceholder
         })
         .data('placeholder-enabled', true)
         .trigger('blur.placeholder');
       return $this;
     };

     placeholder.input = isInputSupported;
     placeholder.textarea = isTextareaSupported;

     hooks = {
       'get': function(element) {
         var $element = $(element);
         return $element.data('placeholder-enabled') && $element.hasClass('placeholder') ? '' : element.value;
       },
       'set': function(element, value) {
         var $element = $(element);
         if (!$element.data('placeholder-enabled')) {
           return element.value = value;
         }
         if (value == '') {
           element.value = value;
           // Issue #56: Setting the placeholder causes problems if the element continues to have focus.
           if (element != document.activeElement) {
             // We can’t use `triggerHandler` here because of dummy text/password inputs :(
             setPlaceholder.call(element);
           }
         } else if ($element.hasClass('placeholder')) {
           clearPlaceholder.call(element, true, value) || (element.value = value);
         } else {
           element.value = value;
         }
         // `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
         return $element;
       }
     };

     isInputSupported || (valHooks.input = hooks);
     isTextareaSupported || (valHooks.textarea = hooks);

     $(function() {
       // Look for forms
       $(document).delegate('form', 'submit.placeholder', function() {
         // Clear the placeholder values so they don’t get submitted
         var $inputs = $('.placeholder', this).each(clearPlaceholder);
         setTimeout(function() {
           $inputs.each(setPlaceholder);
         }, 10);
       });
     });

     // Clear placeholder values upon page reload
     $(window).bind('beforeunload.placeholder', function() {
       $('.placeholder').each(function() {
         this.value = '';
       });
     });

   }

   function args(elem) {
     // Return an object of element attributes
     var newAttrs = {},
       rinlinejQuery = /^jQuery\d+$/;
     $.each(elem.attributes, function(i, attr) {
       if (attr.specified && !rinlinejQuery.test(attr.name)) {
         newAttrs[attr.name] = attr.value;
       }
     });
     return newAttrs;
   }

   function clearPlaceholder(event, value) {
     var input = this,
       $input = $(input);
     if (input.value == $input.attr('placeholder') && $input.hasClass('placeholder')) {
       if ($input.data('placeholder-password')) {
         $input = $input.hide().next().show().attr('id', $input.removeAttr('id').data('placeholder-id'));
         // If `clearPlaceholder` was called from `$.valHooks.input.set`
         if (event === true) {
           return $input[0].value = value;
         }
         $input.focus();
       } else {
         input.value = '';
         $input.removeClass('placeholder');
         input == document.activeElement && input.select();
       }
     }
   }

   function setPlaceholder() {
     var $replacement,
       input = this,
       $input = $(input),
       $origInput = $input,
       id = this.id;
     if (input.value == '') {
       if (input.type == 'password') {
         if (!$input.data('placeholder-textinput')) {
           try {
             $replacement = $input.clone().attr({
               'type': 'text'
             });
           } catch (e) {
             $replacement = $('<input>').attr($.extend(args(this), {
               'type': 'text'
             }));
           }
           $replacement
             .removeAttr('name')
             .data({
               'placeholder-password': true,
               'placeholder-id': id
             })
             .bind('focus.placeholder', clearPlaceholder);
           $input
             .data({
               'placeholder-textinput': $replacement,
               'placeholder-id': id
             })
             .before($replacement);
         }
         $input = $input.removeAttr('id').hide().prev().attr('id', id).show();
         // Note: `$input[0] != input` now!
       }
       $input.addClass('placeholder');
       $input[0].value = $input.attr('placeholder');
     } else {
       $input.removeClass('placeholder');
     }
   }

 }(this, document, jQuery));

 function isValidDate(year, month, day) {
   var date = new Date(year, (month - 1), day);
   var DateYear = date.getFullYear();
   var DateMonth = date.getMonth();
   var DateDay = date.getDate();
   if (DateYear == year && DateMonth == (month - 1) && DateDay == day)
     return true;
   else
     return false;
 }

 function isChecked(id) {
   var ReturnVal = false;
   $("#" + id).find('input[type="radio"]').each(function() {
     if ($(this).is(":checked"))
       ReturnVal = true;
   });
   $("#" + id).find('input[type="checkbox"]').each(function() {
     if ($(this).is(":checked"))
       ReturnVal = true;
   });
   return ReturnVal;
 }

 (function($) {
   var ValidationErrors = new Array();
   $.fn.validate = function(options) {
     options = $.extend({
       expression: "return true;",
       message: "",
       error_class: "ValidationErrors",
       error_field_class: "error",
       live: true
     }, options);
     var SelfID = $(this).attr("id");
     var unix_time = new Date();
     unix_time = parseInt(unix_time.getTime() / 1000);
     if (!$(this).parents('form:first').attr("id")) {
       $(this).parents('form:first').attr("id", "Form_" + unix_time);
     }
     var FormID = $(this).parents('form:first').attr("id");
     if (!((typeof(ValidationErrors[FormID]) == 'object') && (ValidationErrors[FormID] instanceof Array))) {
       ValidationErrors[FormID] = new Array();
     }
     if (options['live']) {
       if ($(this).find('input').length > 0) {
         $(this).find('input').bind('blur', function() {
           if (validate_field("#" + SelfID, options)) {
             if (options.callback_success)
               options.callback_success(this);
           } else {
             if (options.callback_failure)
               options.callback_failure(this);
           }
         });
         $(this).find('input').bind('focus keypress click', function() {
           $("#" + SelfID).next('.' + options['error_class']).remove();
           $("#" + SelfID).removeClass(options['error_field_class']);
         });
       } else {
         $(this).bind('blur', function() {
           validate_field(this);
         });
         $(this).bind('focus keypress', function() {
           $(this).next('.' + options['error_class']).fadeOut("fast", function() {
             $(this).remove();
           });
           $(this).removeClass(options['error_field_class']);
         });
       }
     }
     $(this).parents("form").submit(function() {
       if (validate_field('#' + SelfID))
         return true;
       else
         return false;
     });

     function validate_field(id) {
       var self = $(id).attr("id");
       var expression = 'function Validate(){' + options['expression'].replace(/VAL/g, '$(\'#' + self + '\').val()') + '} Validate()';
       var validation_state = eval(expression);
       if (!validation_state) {
         if ($(id).next('.' + options['error_class']).length == 0) {
           if (options['message'] != '') {
             $(id).after('<span class="' + options['error_class'] + '">' + options['message'] + '</span>');
           }
           $(id).addClass(options['error_field_class']);
         }
         if (ValidationErrors[FormID].join("|").search(id) == -1)
           ValidationErrors[FormID].push(id);
         return false;
       } else {
         for (var i = 0; i < ValidationErrors[FormID].length; i++) {
           if (ValidationErrors[FormID][i] == id)
             ValidationErrors[FormID].splice(i, 1);
         }
         return true;
       }
     }
   };
   $.fn.validated = function(callback) {
     $(this).each(function() {
       if (this.tagName == "FORM") {
         $(this).submit(function() {
           if (ValidationErrors[$(this).attr("id")].length == 0)
             callback();
           return false;
         });
       }
     });
   };
   $.fn.notvalidated = function(callback) {
     $(this).each(function() {
       if (this.tagName == "FORM") {
         $(this).submit(function() {
           if (ValidationErrors[$(this).attr("id")].length > 0)
             callback();
         });
       }
     });
   };
 })(jQuery);

 $(document).ready(function() {
  equalheight('.b-company-banner_half');
  spec_resize();
  $("input[type=number]").keydown(function(e) {
     // Allow: backspace, delete, tab, escape, enter and .
     if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
       // Allow: Ctrl+A
       (e.keyCode == 65 && e.ctrlKey === true) ||
       // Allow: home, end, left, right
       (e.keyCode >= 35 && e.keyCode <= 39)) {
       return;
     }
     if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
       e.preventDefault();
     }
   });

   $("a[rel*='external']").click(function() {
     this.target = "_blank";
   });

   $('input, textarea').placeholder();

   $(".fancybox").fancybox({
     helpers: {
       overlay: {
         fixed: false
       }
     },
     afterShow: function() {
       $('.fancybox-wrap').swipe({
         swipe: function(event, direction) {
           if (direction === 'left' || direction === 'up') {
             $.fancybox.prev(direction);
           } else {
             $.fancybox.next(direction);
           }
         }
       });
     }
   });

   $(".modal-inline").fancybox({
     type: 'inline',
     fixed: false,
     title: '',
     padding: 0,
     autoResize: false,
     autoCenter: false,
     fitToView: false,
     helpers: {
       overlay: {
         fixed: false
       }
     }
   });

   $(".b-question-popup-link").fancybox({
     padding: 0,
     maxWidth: 540,
     minWidth: 540,
     minHeight: 538,
     scrolling: 'no',
     helpers: {
       overlay: {
         locked: true
       }
     }
   });
   $(".b-question-ok-popup-link").fancybox({
     padding: 0,
     maxWidth: 540,
     minWidth: 540,
     minHeight: 308,
     scrolling: 'no',
     helpers: {
       overlay: {
         locked: true
       }
     }
   });
   $(".b-list-popup-link").fancybox({
     padding: 0,
     maxWidth: 950,
     minWidth: 950,
     minHeight: 1450,
     scrolling: 'no',
     helpers: {
       overlay: {
         locked: true
       }
     }
   });
   fixed_scroll_resize();
   var timer = 0;
   $(".scroll-btn").not(".scroll-btn_open").hover(function() {
       var self = $(this);
       var color = $(this).find("span[class*='__text']").css("color");

       $(this).find("span[class*='__text']").show();
       $(this).find("span[class*='__text']").css("opacity", "0");
       timer = setTimeout(function() {
         self.find("span[class*='__text']").css("opacity", "1");
       }, 150);
       fixed_scroll_resize();
     },
     function() {
       clearTimeout(timer);
       $(this).find("span[class*='__text']").hide();
       fixed_scroll_resize();
     }
   );
   section_resize();
   $(".b-scroll-banner__btn_open").click(function() {
     open_spec();
   });
   $(".b-scroll-banner__btn_close").click(function() {
     close_spec();
   });
 });

 function spec_resize() {
   $(".b-spec__item").height($(".b-spec__item").width());
 }
 $(window).resize(function() {
  equalheight('.b-company-banner_half');
   setTimeout(function() {
     section_resize();
     fixed_scroll_resize();
     scroll();
     spec_resize();
     $(".b-equip__item").each(function() {
       $(this).css("height", "auto");
     });
   }, 50);
 });

 function fancy_close() {
   $.fancybox.close();
 }

 $(function() {
   var min = 50000;
   var max = 50000000;
   var def_min = 30000000;
   var def_max = 36000000;
   var min_pos = 0;
   var max_pos = 0;

   $("#slider-range").slider({
     range: true,
     min: min,
     max: max,
     values: [def_min, def_max],
     step: min,
     create: function(event, ui) {
       min_pos = parseFloat($(".ui-slider-range").css("left")) + "%";
       max_pos = parseFloat($(".ui-slider-range").css("width")) + parseFloat($(".ui-slider-range").css("left")) - 7 + "%";
       if (parseFloat($(".ui-slider-range").css("left")) > 5) {
         min_pos = parseInt(min_pos) - 7 + "%";
       }
       if (parseFloat($(".ui-slider-range").css("width")) + parseFloat($(".ui-slider-range").css("left")) > 95) {
         max_pos = parseInt(max_pos) - 10 + "%";
       }
       if (parseFloat($(".ui-slider-range").css("width")) < 15) {
         max_pos = parseInt(max_pos) + 8 + "%";
         min_pos = parseInt(min_pos) - 10 + "%";
       }
       $(".b-range__cur-min").css("left", min_pos);
       $(".b-range__cur-max").css("left", max_pos);
       min = $("#slider-range").slider("values", 0);
       max = $("#slider-range").slider("values", 1);
       if (min >= 10000000) {
         min = (min / 1000000).toFixed(1);
         min = min + " млн."
       }
       if (max >= 10000000) {
         max = (max / 1000000).toFixed(1);
         max = max + " млн."
       }
       $(".b-range__cur-min-value").text(min);
       $(".b-range__cur-max-value").text(max);
     },
     slide: slide,
     stop: slide
   });

   function slide() {
     min_pos = parseInt($(".ui-slider-range").css("left"));
     max_pos = parseFloat($(".ui-slider-range").css("width")) + parseFloat($(".ui-slider-range").css("left")) - 50;
     if (parseInt($(".ui-slider-range").css("left")) > 30) {
       min_pos = min_pos - 50;
     }
     if (parseFloat($(".ui-slider-range").css("width")) + parseFloat($(".ui-slider-range").css("left")) > 580) {
       max_pos = max_pos - 50;
     }
     if (parseFloat($(".ui-slider-range").css("width")) < 130) {
       max_pos = max_pos + 50;
       min_pos = min_pos - 70;
     }
     $(".b-range__cur-min").css("left", min_pos);
     $(".b-range__cur-max").css("left", max_pos);
     min = $("#slider-range").slider("values", 0);
     max = $("#slider-range").slider("values", 1);
     if (min >= 10000000) {
       min = (min / 1000000).toFixed(1);
       min = min + " млн."
     }
     if (max >= 10000000) {
       max = (max / 1000000).toFixed(1);
       max = max + " млн."
     }
     $(".b-range__cur-min-value").text(min);
     $(".b-range__cur-max-value").text(max);
   }

   $(".b-switcher__item").click(function() {
     $(this).parent().children(".b-switcher__item").removeClass("b-switcher__item_active");
     $(this).addClass("b-switcher__item_active");
     $(this).parent().children(".b-switcher__block").removeClass("b-switcher__block_active");
     $(this).parent().parent().children(".b-switcher__block").removeClass("b-switcher__block_active");
     var theClass = $(this).attr("class");
     var theClasses = theClass.match(/\w+|"[^"]+"/g);
     var str = theClasses.join(' ');
     var num = parseInt(str.replace(/\D+/g, ""));
     var cls = ".b-switcher__block_" + num;
     $(this).parent().children(cls).addClass("b-switcher__block_active");
     $(this).parent().parent().children(cls).addClass("b-switcher__block_active");
     return false;
   });
   $(".b-equip__item").hover(function() {
       var height = $(this).height();
       $(this).find(".b-equip__item-text").hide();
       $(this).find(".b-equip-control").show();
       $(this).height(height);
     },
     function() {
       $(this).find(".b-equip__item-text").show();
       $(this).find(".b-equip-control").hide();

     });
 });

 function section_resize() {
   var doc_w = $(document).width();
   if (doc_w < 1000) {
     doc_w = 1000;
   }
   var pct_w = parseInt(doc_w) / 100 * 80;
   $(".b-spec_scroll").width(pct_w);
   $(".b-section").width(doc_w);
   $(".b-content").width(pct_w + doc_w);
 }

 function open_spec() {
   var doc_w = $(document).width();
   if (doc_w < 1000) {
     doc_w = 1000;
   }
   var pct_w = parseInt(doc_w) / 100 * 80;
   var cur_w = 0;
   var i_w = 150;
   var timer = setInterval(function() {
     if (cur_w < pct_w) {
       var dif_w = pct_w - cur_w;
       if (dif_w < i_w) {
         i_w = dif_w;
       }
       cur_w = cur_w + i_w;
       $(".b-spec_scroll").width(cur_w);
       spec_resize();
       $(".b-spec_scroll").css("display", "inline-block");
     } else {
       clearInterval(timer);
       $(".b-scroll-banner__btn_open").hide();
       $(".b-scroll-banner__btn_close").show();
       scroll();
     }
   }, 10);
 }

 function close_spec() {
   var doc_w = $(document).width();
   if (doc_w < 1000) {
     doc_w = 1000;
   }
   var pct_w = parseInt(doc_w) / 100 * 80;
   var cur_w = pct_w;
   var i_w = 150;
   var timer = setInterval(function() {
     if (cur_w > 0) {
       cur_w = cur_w - i_w;
       $(".b-spec_scroll").width(cur_w);
       spec_resize();
     } else {
       clearInterval(timer);
       $(".b-spec_scroll").hide();
       $(".b-scroll-banner__btn_open").show();
       $(".b-scroll-banner__btn_close").hide();
       scroll();
     }
   }, 10);
 }

 function scroll() {
   var total_height = 0;
   var items = 0;
   $(".scroll").children().find("[class*='_item']").each(function() {
     items = items + 1;
   });
   var items_in_row = $(".scroll").width() / $(".scroll").children().find("[class*='_item']").width();
   total_height = $(".scroll").children().find("[class*='_item']") * Math.ceil(items / items_in_row);
   $(".scroll").find(".scroll__holder").height(total_height);
   $(".scroll").mCustomScrollbar({
     axis: "y",
     scrollbarPosition: "inside",
     scrollInertia: 200,
     autoDraggerLength: false,
   });
 }
 $(function() {
   $(window).scroll(function() {
     var h_hght = 600;
     var top = $(this).scrollTop();
     if (top > h_hght) {
       $(".fixed-scroll").show();
     } else {
       $(".fixed-scroll").hide();
     }
   });

   $(".b-enum__link").hover(function() {
       $(this).parent().find(".b-enum__preitem").addClass("b-enum__preitem_hover");
       $(this).parent().find(".b-enum__link").addClass("b-enum__link_hover");
     },
     function() {
       $(this).parent().find(".b-enum__preitem").removeClass("b-enum__preitem_hover");
       $(this).parent().find(".b-enum__link").removeClass("b-enum__link_hover");
     });
 });

 function fixed_scroll_resize() {
   var total_width = 0;
   setTimeout(function() {
     $(".fixed-scroll").find(".fixed-scroll__elem").each(function() {
       total_width = total_width + $(this).width() + parseInt($(this).css("padding-left")) + parseInt($(this).css("padding-right")) + parseInt($(this).css("margin-left")) + parseInt($(this).css("margin-right"));
     });
     if (total_width >= $(window).width()) {
       $(".fixed-scroll").width(total_width);
       $(".fixed-scroll").addClass("fixed-scroll_resized");
     } else {
       $(".fixed-scroll").width("100%");
     }
   }, 180);
 }

equalheight = function(container){

var currentTallest = 0,
     currentRowStart = 0,
     rowDivs = new Array(),
     $el,
     topPosition = 0;
 $(container).each(function() {

   $el = $(this);
   $($el).height('auto')
   topPostion = $el.position().top;

   if (currentRowStart != topPostion) {
     for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
       rowDivs[currentDiv].height(currentTallest);
     }
     rowDivs.length = 0; // empty the array
     currentRowStart = topPostion;
     currentTallest = $el.height();
     rowDivs.push($el);
   } else {
     rowDivs.push($el);
     currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
  }
   for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
     rowDivs[currentDiv].height(currentTallest);
   }
 });
}