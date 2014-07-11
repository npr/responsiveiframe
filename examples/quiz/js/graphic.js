var pymChild = null;

function check_answer(e) {
    var $picked = $(e.target);
    var $question = $picked.parents('.question');

    $question.addClass('answered');
    $question.find('.answer').show();

    $question.find('li').each(function(v,k) {
        $(this).unbind('click');
    });

    pymChild.sendHeight();
}

$('.question').find('li').on('click', check_answer);

pymChild = new pym.Child();
