/*
    Copyright (c) 2025 The Solo Fortress 2 Team, all rights reserved.
    Licensed under the BSD 3-Clause License
*/

$("document").ready(() => {
    const currentPath = window.location.pathname
        .replace(/\/index\.html$/, "") // treat index.html as /
        .replace(/\/$/, "");           // remove trailing slash

    $("nav a").each(function() {
        const linkPath = new URL(this.href).pathname
            .replace(/\/index\.html$/, "")
            .replace(/\/$/, "");

        if (currentPath === linkPath || (currentPath === "" && linkPath.endsWith("/"))) {
            $(this)
                .addClass("bg-purple-700 hover:bg-purple-950 text-white")
                .attr("aria-current", "page");
        } else {
            $(this)
                .removeClass("bg-purple-700 hover:bg-purple-950 text-white")
                .removeAttr("aria-current");
        }
    });
});