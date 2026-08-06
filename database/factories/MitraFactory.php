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
            'nik' => $this->faker->numerify('################'),
            'nama_lengkap' => $this->faker->name(),
            'sobat_id' => $this->faker->numerify('######'),
            'no_rekening' => $this->faker->numerify('##########'),
            'nama_bank' => $this->faker->randomElement(['BCA', 'Mandiri', 'BNI', 'BRI', 'Danamon']),
            'no_telepon' => $this->faker->phoneNumber(),
            'alamat' => $this->faker->address(),
            'status_aktif' => $this->faker->boolean(80),
        ];
    }
}
