<?php

declare(strict_types=1);

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get('/')->assertRedirect('/login');
});

test('authenticated users can visit the schedule', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/')->assertStatus(200);
});
