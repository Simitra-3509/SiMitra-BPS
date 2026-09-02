<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePenugasanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'kegiatan_id'       => 'sometimes|required|exists:kegiatans,id',
            'detil_kegiatan_id' => 'sometimes|required|exists:detil_kegiatan,id',
            'mitra_id'          => 'sometimes|required|exists:mitras,id',
            'bulan'             => 'sometimes|required|integer|min:1|max:12',
            'tahun'             => 'sometimes|required|integer',
            'kuota_target'      => 'sometimes|required|numeric|min:1',
            'status'            => 'sometimes|required|string',
            'tanggal_mulai'     => 'nullable|date',
            'tanggal_selesai'   => 'nullable|date|after_or_equal:tanggal_mulai',
        ];
    }
}
