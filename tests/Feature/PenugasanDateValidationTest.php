<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Kegiatan;
use App\Models\DetilKegiatan;
use App\Models\Mitra;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PenugasanDateValidationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup user with operator role to pass authorization
        $this->user = User::factory()->create(['role' => 'operator']);
        
        $this->kegiatan = Kegiatan::factory()->create();
        $this->detil = DetilKegiatan::factory()->create([
            'kegiatan_id' => $this->kegiatan->id,
            'jumlah' => 100, // DIPA target
        ]);
        $this->mitra = Mitra::factory()->create();
    }

    public function test_penugasan_accepts_valid_dates_within_period()
    {
        $response = $this->actingAs($this->user)->post(route('penugasan.store'), [
            'kegiatan_id' => $this->kegiatan->id,
            'detil_kegiatan_id' => $this->detil->id,
            'bulan' => 9,
            'tahun' => 2026,
            'tanggal_mulai' => '2026-09-01',
            'tanggal_selesai' => '2026-09-30',
            'mitras' => [
                [
                    'id' => $this->mitra->id,
                    'kuota_target' => 10,
                ]
            ]
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('penugasans', [
            'mitra_id' => $this->mitra->id,
            'tanggal_mulai' => '2026-09-01',
            'tanggal_selesai' => '2026-09-30',
        ]);
    }

    public function test_penugasan_rejects_dates_outside_period()
    {
        $response = $this->actingAs($this->user)->post(route('penugasan.store'), [
            'kegiatan_id' => $this->kegiatan->id,
            'detil_kegiatan_id' => $this->detil->id,
            'bulan' => 9, // September
            'tahun' => 2026,
            'tanggal_mulai' => '2026-08-31', // August, outside September
            'tanggal_selesai' => '2026-09-10',
            'mitras' => [
                [
                    'id' => $this->mitra->id,
                    'kuota_target' => 10,
                ]
            ]
        ]);

        $response->assertSessionHasErrors('tanggal_mulai');
        
        $response = $this->actingAs($this->user)->post(route('penugasan.store'), [
            'kegiatan_id' => $this->kegiatan->id,
            'detil_kegiatan_id' => $this->detil->id,
            'bulan' => 9,
            'tahun' => 2026,
            'tanggal_mulai' => '2026-09-01',
            'tanggal_selesai' => '2026-10-01', // October, outside September
            'mitras' => [
                [
                    'id' => $this->mitra->id,
                    'kuota_target' => 10,
                ]
            ]
        ]);

        $response->assertSessionHasErrors('tanggal_selesai');
    }
}
