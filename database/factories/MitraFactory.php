<?php

namespace Database\Factories;

use App\Models\Mitra;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Mitra>
 */
class MitraFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sobat_id' => (string)$this->faker->unique()->numberBetween(100000, 999999),
            'nama_lengkap' => $this->faker->name,
            'alamat' => $this->faker->address,
            'kecamatan' => $this->faker->city,
            'catatan' => $this->faker->sentence(),
            'status_aktif' => $this->faker->boolean(80),
        ];
    }
}
