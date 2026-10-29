<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class UserController extends Controller
{
    /**
     * Menampilkan daftar pengguna sistem.
     *
     * @return Response
     */
    public function index(): Response
    {
        $users = User::latest()->get(['id', 'name', 'email', 'role', 'created_at']);

        return Inertia::render('Master/Users/Index', [
            'users' => $users,
        ]);
    }

    /**
     * Menyimpan data pengguna baru ke dalam basis data.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:admin_lpm,admin_prodi,operator,viewer,user',
        ], [
            'name.required' => 'Nama lengkap pengguna wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Alamat email sudah terdaftar.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min' => 'Kata sandi minimal 8 karakter.',
            'role.required' => 'Peran / Role pengguna wajib dipilih.',
            'role.in' => 'Peran yang dipilih tidak valid.',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                $validated['password'] = Hash::make($validated['password']);
                User::create($validated);
            });

            return redirect()->route('master.users.index')->with('success', 'Pengguna baru berhasil ditambahkan.');
        } catch (Throwable $e) {
            Log::error('Gagal menambahkan pengguna baru: ' . $e->getMessage(), [
                'exception' => $e,
                'email' => $validated['email'] ?? null,
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan sistem saat menyimpan data pengguna. Silakan coba beberapa saat lagi.');
        }
    }

    /**
     * Memperbarui data pengguna yang ada.
     *
     * @param Request $request
     * @param User $user
     * @return RedirectResponse
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => 'required|string|in:admin_lpm,admin_prodi,operator,viewer,user',
            'password' => 'nullable|string|min:8',
        ], [
            'name.required' => 'Nama lengkap pengguna wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Alamat email sudah terdaftar.',
            'password.min' => 'Kata sandi baru minimal 8 karakter.',
            'role.required' => 'Peran / Role pengguna wajib dipilih.',
            'role.in' => 'Peran yang dipilih tidak valid.',
        ]);

        // Pencegahan Lockout: Jangan izinkan mengubah role admin_lpm jika ia adalah satu-satunya admin_lpm yang tersisa
        if ($user->role === 'admin_lpm' && $validated['role'] !== 'admin_lpm') {
            $adminCount = User::where('role', 'admin_lpm')->count();
            if ($adminCount <= 1) {
                return redirect()->back()
                    ->withInput()
                    ->with('error', 'Tidak dapat mengubah peran Administrator LPM terakhir demi keamanan sistem.');
            }
        }

        try {
            DB::transaction(function () use ($user, $validated) {
                if (!empty($validated['password'])) {
                    $validated['password'] = Hash::make($validated['password']);
                } else {
                    unset($validated['password']);
                }

                $user->update($validated);
            });

            return redirect()->route('master.users.index')->with('success', 'Data pengguna berhasil diperbarui.');
        } catch (Throwable $e) {
            Log::error('Gagal memperbarui pengguna: ' . $e->getMessage(), [
                'exception' => $e,
                'user_id' => $user->id,
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan sistem saat memperbarui data pengguna. Silakan coba beberapa saat lagi.');
        }
    }

    /**
     * Menghapus data pengguna dari sistem.
     *
     * @param User $user
     * @return RedirectResponse
     */
    public function destroy(User $user): RedirectResponse
    {
        // Pencegahan Self-Delete
        if (auth()->id() === $user->id) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.');
        }

        // Pencegahan Lockout: Jangan izinkan menghapus admin_lpm terakhir
        if ($user->role === 'admin_lpm') {
            $adminCount = User::where('role', 'admin_lpm')->count();
            if ($adminCount <= 1) {
                return redirect()->back()->with('error', 'Tidak dapat menghapus Administrator LPM terakhir dalam sistem demi keamanan akses.');
            }
        }

        try {
            $userName = $user->name;

            DB::transaction(function () use ($user) {
                $user->delete();
            });

            return redirect()->route('master.users.index')->with('success', 'Pengguna "' . $userName . '" berhasil dihapus.');
        } catch (Throwable $e) {
            Log::error('Gagal menghapus pengguna: ' . $e->getMessage(), [
                'exception' => $e,
                'user_id' => $user->id,
            ]);

            return redirect()->back()->with('error', 'Terjadi kesalahan sistem saat menghapus data pengguna. Silakan coba beberapa saat lagi.');
        }
    }
}
