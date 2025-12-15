import { createFileRoute, Link } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  // const { user } = Route.useRouteContext();

  const highlights = [
    {
      label: 'Wilayah pantau',
      value: 'Jawa • Bali • NTB',
      detail: 'Pasar dan demplot',
    },
    {
      label: 'Program berjalan',
      value: '3 fokus',
      detail: 'Peta pasar, roadshow, sosialisasi',
    },
    {
      label: 'Target 2026',
      value: 'Q1–Q2',
      detail: 'Monitoring & penetrasi produk',
    },
  ];

  const mainPrograms = [
    {
      title: 'Peta Pasar & Strategi Penjualan',
      description: 'Identifikasi kebutuhan konsumen dan peta sales channel.',
      icon: '🗺️',
    },
    {
      title: 'Roadshow Customer',
      description: 'Sales channel, end user visit, monitoring pasar produk.',
      icon: '📍',
    },
    {
      title: 'Sosialisasi & Demplot',
      description: 'Penguatan brand awareness dan edukasi produk.',
      icon: '📣',
    },
  ];

  const monitoringPrograms = [
    {
      title: 'Monitoring pasar produk baru',
      detail: 'Jawa | Bali • Juni – September 2026',
      icon: '🌾',
    },
    {
      title: 'Monitoring kerjasama demplot',
      detail: 'Biofertil & Petro Gladiator • Feb 2026',
      icon: '🤝',
    },
    {
      title: 'Penetrasi pasar Petro Fish',
      detail: 'Pelaku usaha tambak skala menengah-besar • Apr – Mei 2026',
      icon: '🐠',
    },
  ];

  const orgStructure = {
    leader: {
      name: 'Achmad Zaid',
      title: 'PM Manajemen Produk Baru',
      role: 'PM',
    },
    deputy: {
      name: 'Erwin Indra P',
      title: 'SMD I Manajemen Produk Baru',
      role: 'SMD I',
    },
    duties: [
      'Pemetaan pasar dan pengembangan produk baru',
      'Memastikan target penjualan & evaluasi pencapaian',
      'Mengembangkan strategi penjualan',
      'Sosialisasi change management internal & eksternal',
      'Memenuhi aspek legal & good corporate governance',
    ],
  } as const;

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-green-50 to-white text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="-left-16 absolute top-10 h-64 w-64 rounded-full bg-gradient-to-r from-green-400/20 to-teal-400/15 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-gradient-to-r from-teal-400/15 to-emerald-400/15 blur-3xl" />
        <div className="-translate-x-1/2 absolute top-20 left-1/2 h-px w-[70vw] bg-gradient-to-r from-transparent via-green-300/30 to-transparent" />
      </div>

      <main className="relative">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-20 pb-12 md:pt-28 md:pb-16">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 ring-1 ring-green-200">
              <Badge
                className="bg-green-600 font-medium text-white text-xs"
                variant="secondary"
              >
                Manajemen Produk Baru
              </Badge>
              <span className="text-slate-600 text-xs">
                Desember 2025 • Komp. Mitra Bisnis
              </span>
            </div>

            <h1 className="mb-6 font-bold text-4xl text-slate-900 leading-tight md:text-5xl lg:text-6xl">
              Manajemen Produk Baru
            </h1>
            <p className="mx-auto mb-10 max-w-3xl text-lg text-slate-700 md:text-xl">
              Rangkaian kegiatan pemasaran, market intelligence, dan brand
              awareness untuk produk baru/pengembangan Petrokimia Gresik.
            </p>

            <div className="mb-12 flex flex-col flex-wrap justify-center gap-4 sm:flex-row sm:items-center">
              <Link to="/map">
                <Button
                  className="w-full border-green-300 text-slate-900 hover:bg-green-50 sm:w-auto"
                  size="lg"
                  variant="outline"
                >
                  Lihat Peta Pemasaran
                </Button>
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {highlights.map((item) => (
                <Card
                  className="border-green-200 bg-white shadow-sm"
                  key={item.label}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="font-semibold text-slate-600 text-sm">
                      {item.label}
                    </CardTitle>
                    <CardDescription className="font-bold text-3xl text-green-600">
                      {item.value}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 text-slate-500 text-xs">
                    {item.detail}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Program Kerja Section */}
        <section className="container mx-auto px-4 pb-16 md:pb-24">
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-green-100 text-green-700">
              Program Kerja Utama
            </Badge>
            <h2 className="mb-4 font-bold text-3xl text-slate-900 md:text-4xl">
              Fokus Kegiatan Pemasaran
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-700">
              Tiga pilar utama untuk meningkatkan awareness dan adopsi produk
              baru Petrokimia Gresik di pasar.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {mainPrograms.map((program) => (
              <Card
                className="border-green-200 bg-white shadow-lg transition hover:border-green-300 hover:shadow-xl"
                key={program.title}
              >
                <CardHeader>
                  <div className="mb-2 text-5xl">{program.icon}</div>
                  <CardTitle className="text-slate-900 text-xl">
                    {program.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">{program.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Monitoring Program Section */}
        <section className="container mx-auto px-4 pb-16 md:pb-24">
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-green-100 text-green-700">
              Monitoring & Penetrasi 2026
            </Badge>
            <h2 className="mb-4 font-bold text-3xl text-slate-900 md:text-4xl">
              Program Lapangan
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-700">
              Tiga alur kerja prioritas untuk memetakan pasar, menguji demplot,
              dan memperluas penetrasi produk Petrokimia Gresik.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {monitoringPrograms.map((item) => (
              <Card
                className="border-green-200 bg-white shadow-md transition hover:border-green-300 hover:shadow-lg"
                key={item.title}
              >
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <CardTitle className="text-lg text-slate-900">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    {item.detail}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Organisasi Section */}
        <section className="container mx-auto px-4 pb-16 md:pb-24">
          <div className="rounded-3xl border border-green-200 bg-white p-8 shadow-lg md:p-12">
            <div className="mb-10 text-center">
              <Badge className="mb-4 bg-green-100 text-green-700">
                Struktur Organisasi
              </Badge>
              <h2 className="mb-4 font-bold text-3xl text-slate-900 md:text-4xl">
                Tim Manajemen Produk Baru 2025
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-700">
                Struktur organisasi dan tanggung jawab utama untuk pelaksanaan
                program MPB.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Leadership */}
              <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-teal-50 p-6">
                <h3 className="mb-2 font-bold text-2xl text-green-600">
                  {orgStructure.leader.role}
                </h3>
                <p className="mb-1 font-semibold text-slate-900 text-xl">
                  {orgStructure.leader.name}
                </p>
                <p className="text-slate-700 text-sm">
                  {orgStructure.leader.title}
                </p>
              </div>

              <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-teal-50 to-emerald-50 p-6">
                <h3 className="mb-2 font-bold text-2xl text-teal-600">
                  {orgStructure.deputy.role}
                </h3>
                <p className="mb-1 font-semibold text-slate-900 text-xl">
                  {orgStructure.deputy.name}
                </p>
                <p className="text-slate-700 text-sm">
                  {orgStructure.deputy.title}
                </p>
              </div>
            </div>

            {/* Duties */}
            <div className="mt-10 border-green-200 border-t pt-10">
              <h3 className="mb-6 font-bold text-slate-900 text-xl">
                Tanggung Jawab Utama
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {orgStructure.duties.map((duty) => (
                  <div
                    className="flex items-start gap-3 rounded-lg border border-green-100 bg-green-50 p-4"
                    key={duty}
                  >
                    <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                      <span className="font-bold text-sm">✓</span>
                    </div>
                    <p className="text-slate-700">{duty}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 pb-12">
          <div className="rounded-3xl border border-green-200 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 text-center text-white shadow-xl md:p-12">
            <h2 className="mb-4 font-bold text-3xl md:text-4xl">
              Lihat Peta Pemasaran?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-green-50 text-lg">
              Jelajahi peta persebaran pasar dan potensi produk baru Petrokimia
              Gresik.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              {/* <Link to={user ? '/dashboard' : '/auth/signup'}>
                <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-blue-50 sm:w-auto">
                  {user ? 'Buka Dashboard' : 'Daftar Sekarang'}
                </Button>
              </Link> */}
              <Link to="/map">
                <Button
                  className="w-full border-white/60 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
                  size="lg"
                  variant="outline"
                >
                  Lihat Peta Pemasaran
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
