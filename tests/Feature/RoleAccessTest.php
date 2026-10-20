<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function operator_cannot_access_ppk_only_routes()
    {
        $operator = User::factory()->create(['role' => 'operator']);

        $response = $this->actingAs($operator)
                         ->get(route('spk.create'));

        $response->assertStatus(403);
    }
}
