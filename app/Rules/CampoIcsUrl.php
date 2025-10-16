<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Str;

final class CampoIcsUrl implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            $fail('The :attribute must be a valid Campo ICS URL.');

            return;
        }

        if (! filter_var($value, FILTER_VALIDATE_URL)) {
            $fail('The :attribute must be a valid URL.');

            return;
        }

        $parsed = parse_url($value);
        if ($parsed === false || ! isset($parsed['scheme'], $parsed['host'], $parsed['path'])) {
            $fail('The :attribute must be a valid URL.');

            return;
        }

        if ($parsed['scheme'] !== 'https') {
            $fail('The :attribute must use HTTPS.');

            return;
        }

        if (! Str::endsWith(Str::lower($parsed['host']), '.campo.fau.de')) {
            $fail('The :attribute must be a Campo FAU URL.');

            return;
        }

        if (! Str::contains($parsed['path'], 'individualTimetableCalendarExport')) {
            $fail('The :attribute must be a valid Campo calendar export URL.');
        }
    }
}
