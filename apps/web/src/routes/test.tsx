import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import type { PieLabelRenderProps } from 'recharts';
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const Route = createFileRoute('/test')({
  component: RouteComponent,
});

type ProductGroup =
  | 'pupuk'
  | 'perikanan'
  | 'ruminansia'
  | 'unggas'
  | 'dekomposer';

type CommodityItem = { name: string; value: number; color: string };

type Province = {
  id: string;
  name: string;
  regencies: { id: string; name: string }[];
};

const PROVINCES: Province[] = [
  {
    id: 'nasional',
    name: 'Nasional',
    regencies: [{ id: 'nasional', name: 'Nasional' }],
  },
  {
    id: 'jabar',
    name: 'Jawa Barat',
    regencies: [
      { id: 'jabar', name: 'Jawa Barat' },
      { id: 'bandung', name: 'Kab. Bandung' },
      { id: 'bogor', name: 'Kab. Bogor' },
      { id: 'cirebon', name: 'Kab. Cirebon' },
    ],
  },
  {
    id: 'jateng',
    name: 'Jawa Tengah',
    regencies: [
      { id: 'jateng', name: 'Jawa Tengah' },
      { id: 'semarang', name: 'Kab. Semarang' },
      { id: 'magelang', name: 'Kab. Magelang' },
      { id: 'kudus', name: 'Kab. Kudus' },
    ],
  },
  {
    id: 'jatim',
    name: 'Jawa Timur',
    regencies: [
      { id: 'jatim', name: 'Jawa TImur' },
      { id: 'sidoarjo', name: 'Kab. Sidoarjo' },
      { id: 'malang', name: 'Kab. Malang' },
      { id: 'gresik', name: 'Kab. Gresik' },
    ],
  },
];

function RouteComponent() {
  const [group, setGroup] = useState<ProductGroup>('pupuk');

  // province/regency state
  const [provinceId, setProvinceId] = useState<string>(PROVINCES[0]?.id ?? '');
  const province = useMemo(
    () =>
      PROVINCES.find((p) => p.id === provinceId) ??
      PROVINCES[0] ?? { id: '', name: '', regencies: [] },
    [provinceId]
  );
  const [regencyId, setRegencyId] = useState<string>(
    province.regencies[0]?.id ?? ''
  );
  const regencies = province.regencies;

  // Reset regency when province changes
  const handleProvinceChange = (id: string) => {
    setProvinceId(id);
    const nextProvince = PROVINCES.find((p) => p.id === id) ??
      PROVINCES[0] ?? { id: '', name: '', regencies: [] };
    setRegencyId(nextProvince.regencies[0]?.id ?? '');
  };

  const { commodities, realization } = useMemo(
    () => buildConfigFor(group),
    [group]
  );

  return (
    <div className="grid grid-cols-1 gap-6 px-4 py-6 md:px-6 lg:grid-cols-3 lg:px-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:col-span-3">
        <div>
          <Label
            className="mb-2 block font-medium text-sm"
            htmlFor="jenis-produk"
          >
            JENIS PRODUK
          </Label>
          <Select
            onValueChange={(v) => setGroup(v as ProductGroup)}
            value={group}
          >
            <SelectTrigger className="w-full max-w-xs" id="jenis-produk">
              <SelectValue placeholder="Pilih jenis produk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pupuk">Produk pupuk</SelectItem>
              <SelectItem value="perikanan">Probiotik perikanan</SelectItem>
              <SelectItem value="ruminansia">
                Probiotik peternakan ruminansia
              </SelectItem>
              <SelectItem value="unggas">
                Probiotik peternakan unggas
              </SelectItem>
              <SelectItem value="dekomposer">Dekomposer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 block font-medium text-sm" htmlFor="provinsi">
            PROVINSI
          </Label>
          <Select onValueChange={handleProvinceChange} value={provinceId}>
            <SelectTrigger className="w-full max-w-xs" id="provinsi">
              <SelectValue placeholder="Pilih provinsi" />
            </SelectTrigger>
            <SelectContent>
              {PROVINCES.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 block font-medium text-sm" htmlFor="kabupaten">
            KABUPATEN
          </Label>
          <Select onValueChange={(v) => setRegencyId(v)} value={regencyId}>
            <SelectTrigger className="w-full max-w-xs" id="kabupaten">
              <SelectValue placeholder="Pilih kabupaten" />
            </SelectTrigger>
            <SelectContent>
              {regencies.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TargetAreaCard />
      <CommoditiesCard data={commodities} />
      {realization.map((cfg) => (
        <RealizationCard key={cfg.jenis_produk} {...cfg} />
      ))}
    </div>
  );
}

// Data & helpers
const COLORS = {
  tanpang: '#6EAC42',
  horti: '#4A74C0',
  kebun: '#F2B706',
} as const;

const targetData = {
  total: 1_274_539,
  byType: {
    tanpang: 313_844,
    horti: 11_929,
    kebun: 948_766,
  },
};

function formatIdNumber(value: number) {
  return new Intl.NumberFormat('id-ID').format(value);
}

function getPercent(part: number, total: number) {
  return Math.round((part / total) * 100);
}

const RADIAN = Math.PI / 180;
function renderPercentLabelInside(props: PieLabelRenderProps) {
  const cx = typeof props.cx === 'number' ? props.cx : 0;
  const cy = typeof props.cy === 'number' ? props.cy : 0;
  const midAngle = typeof props.midAngle === 'number' ? props.midAngle : 0;
  const innerRadius =
    typeof props.innerRadius === 'number' ? props.innerRadius : 0;
  const outerRadius =
    typeof props.outerRadius === 'number' ? props.outerRadius : 0;
  const value =
    typeof props.value === 'number' ? props.value : Number(props.value ?? 0);
  const percent = typeof props.percent === 'number' ? props.percent : 0;

  const isSmall = percent < 0.08;
  const innerPos = innerRadius + (outerRadius - innerRadius) * 0.6;
  const outerPos = outerRadius + 16;
  const radius = isSmall ? outerPos : innerPos;
  const x = cx + Math.cos(-RADIAN * midAngle) * radius;
  const y = cy + Math.sin(-RADIAN * midAngle) * radius;
  const anchor = isSmall ? (x > cx ? 'start' : 'end') : 'middle';

  return (
    <text
      dominantBaseline="central"
      fill="#0B0B0B"
      fontWeight={700}
      textAnchor={anchor}
      x={x}
      y={y}
    >
      {`${value}%`}
    </text>
  );
}

function TargetAreaCard() {
  const { total, byType } = targetData;
  const stacked = [
    {
      label: 'Sasaran',
      tanpang: getPercent(byType.tanpang, total),
      horti: getPercent(byType.horti, total),
      kebun: getPercent(byType.kebun, total),
    },
  ];

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Luas Sasaran Tanam (Ha)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-[14px] border border-[--border] p-4 text-center">
          <div className="font-extrabold text-4xl tracking-wide md:text-5xl">
            {formatIdNumber(total)}
          </div>
        </div>
        <div className="mt-4 h-16 w-full">
          <ResponsiveContainer>
            <BarChart data={stacked} layout="vertical" stackOffset="expand">
              <XAxis hide type="number" />
              <YAxis dataKey="label" hide type="category" />
              <Tooltip
                formatter={(value: unknown, name) => {
                  if (name === 'tanpang') {
                    return [`${value}%`, 'Luas Tanpang'];
                  }
                  if (name === 'horti') {
                    return [`${value}%`, 'Luas Horti'];
                  }
                  if (name === 'kebun') {
                    return [`${value}%`, 'Luas Kebun'];
                  }
                  return [value as string, name as string];
                }}
              />
              <Bar
                dataKey="tanpang"
                fill={COLORS.tanpang}
                radius={[6, 0, 0, 6]}
                stackId="1"
              >
                <LabelList
                  dataKey="tanpang"
                  formatter={(v: number) => `${v}%`}
                  position="inside"
                  style={{ fill: '#0B0B0B', fontWeight: 700 }}
                />
              </Bar>
              <Bar dataKey="horti" fill={COLORS.horti} stackId="1">
                <LabelList
                  dataKey="horti"
                  formatter={(v: number) => `${v}%`}
                  position="inside"
                  style={{ fill: '#0B0B0B', fontWeight: 700 }}
                />
              </Bar>
              <Bar
                dataKey="kebun"
                fill={COLORS.kebun}
                radius={[0, 6, 6, 0]}
                stackId="1"
              >
                <LabelList
                  dataKey="kebun"
                  formatter={(v: number) => `${v}%`}
                  position="inside"
                  style={{ fill: '#0B0B0B', fontWeight: 700 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2 md:grid-cols-[auto_auto_1fr_auto]">
          <LegendDot color={COLORS.tanpang} label="Luas Tanpang" />
          <div className="md:col-span-2" />
          <div className="justify-self-end font-medium">
            {formatIdNumber(byType.tanpang)}
          </div>

          <LegendDot color={COLORS.horti} label="Luas Horti" />
          <div className="md:col-span-2" />
          <div className="justify-self-end font-medium">
            {formatIdNumber(byType.horti)}
          </div>

          <LegendDot color={COLORS.kebun} label="Luas Kebun" />
          <div className="md:col-span-2" />
          <div className="justify-self-end font-medium">
            {formatIdNumber(byType.kebun)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block h-4 w-4 rounded-sm"
        style={{ backgroundColor: color }}
      />
      <span className="font-medium text-sm">{label}</span>
    </div>
  );
}

function CommoditiesCard({ data }: { data: CommodityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Komoditas Potensial</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto]">
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart margin={{ top: 16, right: 40, bottom: 16, left: 40 }}>
                <Tooltip
                  formatter={(v: unknown, n) => [`${v}%`, n as string]}
                />
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={55}
                  label={renderPercentLabelInside}
                  labelLine={false}
                  nameKey="name"
                  outerRadius={95}
                  strokeWidth={2}
                >
                  {data.map((entry) => (
                    <Cell fill={entry.color} key={entry.name} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 md:w-48">
            {data.map((d) => (
              <div className="flex items-center gap-2" key={d.name}>
                <span
                  className="inline-block h-3 w-3 rounded-sm"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-sm">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Props for reusable realization card
type RealizationCardProps = {
  total: number;
  value_tanpang: number;
  value_horti: number;
  value_kebun: number;
  jenis_produk: string;
};

function RealizationCard({
  total,
  value_tanpang,
  value_horti,
  value_kebun,
  jenis_produk,
}: RealizationCardProps) {
  const shares = [
    { name: 'TANPANG', value: value_tanpang, color: COLORS.tanpang },
    { name: 'HORTI', value: value_horti, color: COLORS.horti },
    { name: 'KEBUN', value: value_kebun, color: COLORS.kebun },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{jenis_produk}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="mx-auto h-64 w-full max-w-[260px]">
          <ResponsiveContainer>
            <PieChart margin={{ top: 20, right: 28, bottom: 20, left: 28 }}>
              <Tooltip formatter={(v: unknown, n) => [`${v}%`, n as string]} />
              <Pie
                data={shares}
                dataKey="value"
                endAngle={-270}
                label={renderPercentLabelInside}
                labelLine={false}
                nameKey="name"
                outerRadius={100}
                startAngle={90}
              >
                {shares.map((s) => (
                  <Cell fill={s.color} key={s.name} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mx-auto mt-4 w-56 rounded-xl border py-3 text-center font-extrabold text-3xl">
          {formatIdNumber(total)}
        </div>
      </CardContent>
    </Card>
  );
}

// Build config based on selected product group
function buildConfigFor(group: ProductGroup): {
  commodities: CommodityItem[];
  realization: RealizationCardProps[];
} {
  const palette = [
    '#6EAC42',
    '#4A74C0',
    '#F5B84B',
    '#EC7C3A',
    '#6E41B6',
    '#F2B706',
  ];
  const evenSplit = (n: number): number[] => {
    const base = Math.floor(100 / n);
    const rem = 100 - base * n;
    return Array.from({ length: n }, (_, i) => base + (i < rem ? 1 : 0));
  };

  if (group === 'pupuk') {
    const labels = ['SAWIT', 'PADI', 'KOPI', 'KARET', 'LAINNYA'];
    const values = [20, 20, 18, 9, 33];
    const commodities = labels.map((name, i) => ({
      name,
      value: values[i] ?? 0,
      color: palette[i] ?? palette[0],
    }));
    const realization: RealizationCardProps[] = [
      {
        jenis_produk: 'Petroganik Premium',
        total: 276_485,
        value_tanpang: 30,
        value_horti: 2,
        value_kebun: 68,
      },
      {
        jenis_produk: 'Phonska Alam',
        total: 220_100,
        value_tanpang: 28,
        value_horti: 4,
        value_kebun: 68,
      },
      {
        jenis_produk: 'Phonska Cair',
        total: 180_320,
        value_tanpang: 26,
        value_horti: 6,
        value_kebun: 68,
      },
      {
        jenis_produk: 'Phonska Lite',
        total: 196_780,
        value_tanpang: 32,
        value_horti: 3,
        value_kebun: 65,
      },
      {
        jenis_produk: 'Petro Kplus',
        total: 150_000,
        value_tanpang: 25,
        value_horti: 7,
        value_kebun: 68,
      },
      {
        jenis_produk: 'Petrobio Fertil',
        total: 150_500,
        value_tanpang: 25,
        value_horti: 7,
        value_kebun: 68,
      },
      {
        jenis_produk: 'Phonska Oca Plus',
        total: 190_230,
        value_tanpang: 29,
        value_horti: 3,
        value_kebun: 68,
      },
    ];
    return { commodities, realization };
  }

  if (group === 'perikanan') {
    const labels = ['BANDENG', 'NILA', 'LELE', 'UDANG', 'LAINNYA'];
    const values = evenSplit(labels.length);
    const commodities = labels.map((name, i) => ({
      name,
      value: values[i] ?? 0,
      color: palette[i] ?? palette[0],
    }));
    const realization: RealizationCardProps[] = [
      {
        jenis_produk: 'Petrofish',
        total: 160_010,
        value_tanpang: 30,
        value_horti: 2,
        value_kebun: 68,
      },
    ];
    return { commodities, realization };
  }

  if (group === 'ruminansia') {
    const labels = ['SAPI', 'KERBAU', 'KAMBING', 'DOMBA', 'LAINNYA'];
    const values = evenSplit(labels.length);
    const commodities = labels.map((name, i) => ({
      name,
      value: values[i] ?? 0,
      color: palette[i] ?? palette[0],
    }));
    const realization: RealizationCardProps[] = [
      {
        jenis_produk: 'Petrobiofeed',
        total: 140_000,
        value_tanpang: 30,
        value_horti: 2,
        value_kebun: 68,
      },
    ];
    return { commodities, realization };
  }

  if (group === 'unggas') {
    const labels = ['AYAM', 'BEBEK', 'BURUNG', 'LAINNYA'];
    const values = evenSplit(labels.length);
    const commodities = labels.map((name, i) => ({
      name,
      value: values[i] ?? 0,
      color: palette[i] ?? palette[0],
    }));
    const realization: RealizationCardProps[] = [
      {
        jenis_produk: 'Petrochick',
        total: 155_000,
        value_tanpang: 30,
        value_horti: 2,
        value_kebun: 68,
      },
    ];
    return { commodities, realization };
  }

  // dekomposer
  const labels = ['LAINNYA'];
  const values = [100];
  const commodities = labels.map((name, i) => ({
    name,
    value: values[i] ?? 0,
    color: palette[5] ?? palette[0],
  }));
  const realization: RealizationCardProps[] = [
    {
      jenis_produk: 'Petro Gladiator',
      total: 172_440,
      value_tanpang: 27,
      value_horti: 5,
      value_kebun: 68,
    },
    {
      jenis_produk: 'Petro Gladiator Cair',
      total: 158_900,
      value_tanpang: 27,
      value_horti: 5,
      value_kebun: 68,
    },
  ];
  return { commodities, realization };
}
