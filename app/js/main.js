$(function() {
  // Placeholder fix for IE
  $('.lt-ie10 [placeholder]').focus(function() {
    var i = $(this);
    if (i.val() == i.attr('placeholder')) {
      i.val('').removeClass('placeholder');
      if (i.hasClass('password')) {
        i.removeClass('password');
        this.type = 'password';
      }
    }
  }).blur(function() {
    if (i.val() == '' || i.val() == i.attr('placeholder')) {
      if (this.type == 'password') {
        i.addClass('password');
        this.type = 'text';
      }
      i.addClass('placeholder').val(i.attr('placeholder'));
    }
  }).blur().parents('form').submit(function() {
    //if($(this).validationEngine('validate')) { // If using validationEngine
    $(this).find('[placeholder]').each(function() {
        var i = $(this);
        if (i.val() == i.attr('placeholder'))
          i.val('');
        i.removeClass('placeholder');
      });
      //}
  });
});
