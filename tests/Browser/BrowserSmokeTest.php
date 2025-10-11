<?php

declare(strict_types=1);

namespace Tests\Feature;

test('no smoke on guest routes', function () {
    visit(['/', '/login', '/register', '/forgot-password'])
        ->assertNoSmoke()
        ->assertNoConsoleLogs()
        ->assertNoJavaScriptErrors();

});
