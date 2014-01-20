function transition_to(replacement_div) {
    $(active_div).hide();
    $(replacement_div).show();
    active_div = replacement_div;
}

var active_div = '#panel_step1';
$('#btn_step1_next').click(function(){transition_to('#panel_step2');});
$('#btn_step2_next').click(function(){transition_to('#panel_step3');});
$('#btn_step3_next').click(function(){transition_to('#panel_step4');});

$('#btn_step2_prev').click(function(){transition_to('#panel_step1');});
$('#btn_step3_prev').click(function(){transition_to('#panel_step2');});
$('#btn_step4_prev').click(function(){transition_to('#panel_step3');});
