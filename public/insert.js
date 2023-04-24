function makePostRequest(url, fields)
{
    const form = $('<form>', {
        action: url,
        method: 'POST',
    });
    for (const k in fields)
    {
         $('<input>').attr({
             type: "hidden",
             name: k,
             value: fields[k]
         }).appendTo(form);
    }
    form.appendTo('body').submit();
}

function found(n)
{
}

(function()
{
	if (!document.getElementById("add_css"))
	{
		const head = document.getElementsByTagName('head')[0];
		const link = document.createElement('link');
		link.id = "add_css";
		link.rel = "stylesheet";
		link.type = "text/css";
		link.href = "/frontend/styles.css";
		link.media = "all";
		head.appendChild(link);
	}

    const elem_id = "";
    const h = document.getElementById(elem_id);
    if (h)
    {
        found(h);
    }
    else
    {
        new MutationObserver((records, observer) =>
        {
            for (const r of records)
            {
                if (r.addedNodes && r.addedNodes.length > 0)
                {
                    for (const n of r.addedNodes)
                    {
                        if (n.id == elem_id)
                        {
                            observer.disconnect();
                            found(n);
                            return;
                        }
                    }
                }
            }
        }).observe(document, {subtree:true, childList:true});
    }
})();
