from app.models import Stage, TrackPoint

STAGES: list[Stage] = [
    Stage(
        id=1,
        name="Bay of Palma",
        subtitle="Stage 1 · Flat opener",
        distance_km=96.4,
        elevation_gain_m=620,
        terrain="flat",
        start="Palma",
        finish="Port d'Alcúdia",
        description=(
            "The race kicks off with a fast, rolling stage from Palma de Mallorca "
            "across the island's fertile plains to the bay of Alcúdia. Expect a "
            "chaotic bunch sprint finish on the seafront promenade after teams contest "
            "the intermediate sprints through Inca and Muro. The peloton crosses the "
            "Raiguer plateau with constant crosswind threat before the final coastal "
            "run-in. A perfect stage for the sprinters before the mountains take over."
        ),
        track=[
            TrackPoint(lat=39.5696, lon=2.6502, ele=25),
            TrackPoint(lat=39.5840, lon=2.6720, ele=38),
            TrackPoint(lat=39.6020, lon=2.6980, ele=62),
            TrackPoint(lat=39.6180, lon=2.7240, ele=95),
            TrackPoint(lat=39.6270, lon=2.7490, ele=118),
            TrackPoint(lat=39.6410, lon=2.7760, ele=142),
            TrackPoint(lat=39.6530, lon=2.8010, ele=158),
            TrackPoint(lat=39.6680, lon=2.8260, ele=145),
            TrackPoint(lat=39.6820, lon=2.8490, ele=132),
            TrackPoint(lat=39.6980, lon=2.8710, ele=148),
            TrackPoint(lat=39.7120, lon=2.8940, ele=162),
            TrackPoint(lat=39.7190, lon=2.9100, ele=140),
            TrackPoint(lat=39.7280, lon=2.9350, ele=118),
            TrackPoint(lat=39.7360, lon=2.9580, ele=88),
            TrackPoint(lat=39.7430, lon=2.9820, ele=65),
            TrackPoint(lat=39.7490, lon=3.0080, ele=55),
            TrackPoint(lat=39.7510, lon=3.0340, ele=48),
            TrackPoint(lat=39.7640, lon=3.0590, ele=42),
            TrackPoint(lat=39.7820, lon=3.0780, ele=38),
            TrackPoint(lat=39.8020, lon=3.0920, ele=28),
            TrackPoint(lat=39.8220, lon=3.1040, ele=22),
            TrackPoint(lat=39.8380, lon=3.1130, ele=18),
            TrackPoint(lat=39.8531, lon=3.1219, ele=12),
            TrackPoint(lat=39.8550, lon=3.1300, ele=8),
            TrackPoint(lat=39.8570, lon=3.1370, ele=3),
        ],
    ),
    Stage(
        id=2,
        name="Tramuntana Traverse",
        subtitle="Stage 2 · Hilly",
        distance_km=78.2,
        elevation_gain_m=1850,
        terrain="hilly",
        start="Alcúdia",
        finish="Sóller",
        description=(
            "This hilly stage links the north-east coast to the Sóller valley, "
            "crossing the spine of the Serra de Tramuntana twice. The peloton "
            "departs from Alcúdia and immediately hits the Coll de sa Bataia before "
            "a fast descent to Pollença. The race then climbs the iconic Puig de "
            "Maria road and rolls through the ancient villages of Campanet and "
            "Caimari. A final lung-busting ascent over the Coll de Sóller (496 m) "
            "leads to the enchanting orange-grove valley. Expect the GC contenders "
            "to throw down moves on the upper slopes."
        ),
        track=[
            TrackPoint(lat=39.8531, lon=3.1219, ele=12),
            TrackPoint(lat=39.8640, lon=3.1050, ele=45),
            TrackPoint(lat=39.8760, lon=3.0850, ele=82),
            TrackPoint(lat=39.8900, lon=3.0620, ele=150),
            TrackPoint(lat=39.9050, lon=3.0420, ele=220),
            TrackPoint(lat=39.9060, lon=3.0150, ele=180),
            TrackPoint(lat=39.8957, lon=3.0050, ele=95),
            TrackPoint(lat=39.8800, lon=2.9820, ele=120),
            TrackPoint(lat=39.8620, lon=2.9600, ele=195),
            TrackPoint(lat=39.8450, lon=2.9380, ele=260),
            TrackPoint(lat=39.8280, lon=2.9140, ele=340),
            TrackPoint(lat=39.8100, lon=2.8960, ele=420),
            TrackPoint(lat=39.7960, lon=2.8740, ele=496),
            TrackPoint(lat=39.7880, lon=2.8510, ele=450),
            TrackPoint(lat=39.7820, lon=2.8280, ele=380),
            TrackPoint(lat=39.7780, lon=2.8050, ele=290),
            TrackPoint(lat=39.7760, lon=2.7820, ele=200),
            TrackPoint(lat=39.7740, lon=2.7600, ele=140),
            TrackPoint(lat=39.7720, lon=2.7380, ele=95),
            TrackPoint(lat=39.7700, lon=2.7240, ele=68),
            TrackPoint(lat=39.7680, lon=2.7180, ele=52),
            TrackPoint(lat=39.7666, lon=2.7154, ele=42),
        ],
    ),
    Stage(
        id=3,
        name="Crown of Calobra",
        subtitle="Stage 3 · Queen stage",
        distance_km=42.1,
        elevation_gain_m=2240,
        terrain="mountain",
        start="Sóller",
        finish="Coll dels Reis",
        description=(
            "The queen stage. From Sóller the race descends to Port de Sóller and "
            "follows the rugged cliff coastline north to the foot of the most "
            "spectacular road in cycling. The Sa Calobra ascent drops 9.4 km to "
            "sea level through 26 hairpins including the legendary Nus de sa Corbata "
            "— a loop where the road passes under itself. Riders then grind back "
            "up to the Coll dels Reis summit at 682 m, averaging 7.1% over 9.4 km. "
            "The finish line crowns a true king of the mountains."
        ),
        track=[
            TrackPoint(lat=39.7666, lon=2.7154, ele=42),
            TrackPoint(lat=39.7740, lon=2.7080, ele=28),
            TrackPoint(lat=39.7840, lon=2.7020, ele=12),
            TrackPoint(lat=39.7960, lon=2.6960, ele=3),
            TrackPoint(lat=39.8050, lon=2.7010, ele=10),
            TrackPoint(lat=39.8150, lon=2.7090, ele=22),
            TrackPoint(lat=39.8240, lon=2.7230, ele=35),
            TrackPoint(lat=39.8330, lon=2.7420, ele=50),
            TrackPoint(lat=39.8410, lon=2.7640, ele=40),
            TrackPoint(lat=39.8470, lon=2.7860, ele=18),
            TrackPoint(lat=39.8514, lon=2.8025, ele=5),
            # Sa Calobra — begin the climb (Nus de sa Corbata zone)
            TrackPoint(lat=39.8490, lon=2.8060, ele=55),
            TrackPoint(lat=39.8460, lon=2.8120, ele=115),
            TrackPoint(lat=39.8430, lon=2.8190, ele=185),
            # tight hairpin — the loop (Nus de sa Corbata)
            TrackPoint(lat=39.8398, lon=2.8230, ele=245),
            TrackPoint(lat=39.8380, lon=2.8265, ele=305),
            TrackPoint(lat=39.8400, lon=2.8305, ele=370),
            TrackPoint(lat=39.8380, lon=2.8350, ele=435),
            TrackPoint(lat=39.8355, lon=2.8395, ele=500),
            TrackPoint(lat=39.8320, lon=2.8435, ele=562),
            TrackPoint(lat=39.8285, lon=2.8468, ele=618),
            TrackPoint(lat=39.8255, lon=2.8488, ele=650),
            TrackPoint(lat=39.8228, lon=2.8475, ele=668),
            TrackPoint(lat=39.8210, lon=2.8455, ele=678),
            TrackPoint(lat=39.8197, lon=2.8440, ele=682),
        ],
    ),
    Stage(
        id=4,
        name="Serra Classic",
        subtitle="Stage 4 · Hilly",
        distance_km=65.8,
        elevation_gain_m=1380,
        terrain="hilly",
        start="Sóller",
        finish="Palma",
        description=(
            "A classic Tramuntana stage that strings together the jewels of the "
            "mountain range. From Sóller the route climbs past the stone terrace "
            "groves of Deià — a village beloved by poets and painters alike — "
            "before the summit at Mirador de ses Barques (270 m). The descent to "
            "Valldemossa winds through holm-oak forest above the sparkling "
            "Mediterranean. A final lively sequence through Esporles and Puigpunyent "
            "leads into Palma's broad boulevard finish. Attackers will relish the "
            "short punchy rises around Deià."
        ),
        track=[
            TrackPoint(lat=39.7666, lon=2.7154, ele=42),
            TrackPoint(lat=39.7620, lon=2.6980, ele=72),
            TrackPoint(lat=39.7560, lon=2.6820, ele=120),
            TrackPoint(lat=39.7498, lon=2.6680, ele=180),
            TrackPoint(lat=39.7480, lon=2.6570, ele=240),
            TrackPoint(lat=39.7490, lon=2.6480, ele=270),
            TrackPoint(lat=39.7478, lon=2.6400, ele=230),
            TrackPoint(lat=39.7440, lon=2.6320, ele=180),
            TrackPoint(lat=39.7380, lon=2.6280, ele=132),
            TrackPoint(lat=39.7300, lon=2.6260, ele=90),
            TrackPoint(lat=39.7200, lon=2.6235, ele=65),
            TrackPoint(lat=39.7128, lon=2.6225, ele=425),
            TrackPoint(lat=39.7050, lon=2.6210, ele=360),
            TrackPoint(lat=39.6960, lon=2.6200, ele=280),
            TrackPoint(lat=39.6860, lon=2.6190, ele=200),
            TrackPoint(lat=39.6740, lon=2.6180, ele=140),
            TrackPoint(lat=39.6620, lon=2.6170, ele=90),
            TrackPoint(lat=39.6510, lon=2.6180, ele=65),
            TrackPoint(lat=39.6380, lon=2.6220, ele=48),
            TrackPoint(lat=39.6220, lon=2.6300, ele=32),
            TrackPoint(lat=39.6060, lon=2.6380, ele=22),
            TrackPoint(lat=39.5890, lon=2.6430, ele=15),
            TrackPoint(lat=39.5750, lon=2.6470, ele=10),
            TrackPoint(lat=39.5696, lon=2.6502, ele=5),
        ],
    ),
    Stage(
        id=5,
        name="Pollença Hills",
        subtitle="Stage 5 · Hilly",
        distance_km=62.3,
        elevation_gain_m=980,
        terrain="hilly",
        start="Alcúdia",
        finish="Alcúdia",
        description=(
            "The final stage loops from Alcúdia through the hill towns above the "
            "Pollença bay before swinging inland past Campanet and Caimari. The "
            "circuit features four categorised climbs including the Puig de Maria "
            "chapel road (320 m) and the steep Coll de la Batalla (290 m). "
            "The race returns to the Alcúdia seafront for a technical town-centre "
            "finish after a short punchy climb on the final kilometre. GC riders "
            "will fight for every second on the last ascent while sprinters try "
            "in vain to hold the wheel."
        ),
        track=[
            TrackPoint(lat=39.8531, lon=3.1219, ele=12),
            TrackPoint(lat=39.8620, lon=3.1080, ele=35),
            TrackPoint(lat=39.8720, lon=3.0900, ele=65),
            TrackPoint(lat=39.8840, lon=3.0720, ele=105),
            TrackPoint(lat=39.8960, lon=3.0540, ele=148),
            TrackPoint(lat=39.9050, lon=3.0360, ele=190),
            TrackPoint(lat=39.9060, lon=3.0150, ele=162),
            TrackPoint(lat=39.8957, lon=2.9980, ele=135),
            TrackPoint(lat=39.8820, lon=2.9780, ele=180),
            TrackPoint(lat=39.8680, lon=2.9580, ele=240),
            TrackPoint(lat=39.8540, lon=2.9400, ele=290),
            TrackPoint(lat=39.8420, lon=2.9240, ele=260),
            TrackPoint(lat=39.8280, lon=2.9320, ele=320),
            TrackPoint(lat=39.8100, lon=2.9440, ele=278),
            TrackPoint(lat=39.7940, lon=2.9600, ele=210),
            TrackPoint(lat=39.7820, lon=2.9800, ele=155),
            TrackPoint(lat=39.7900, lon=3.0020, ele=112),
            TrackPoint(lat=39.8020, lon=3.0240, ele=78),
            TrackPoint(lat=39.8150, lon=3.0480, ele=55),
            TrackPoint(lat=39.8280, lon=3.0720, ele=40),
            TrackPoint(lat=39.8390, lon=3.0940, ele=28),
            TrackPoint(lat=39.8460, lon=3.1100, ele=18),
            TrackPoint(lat=39.8531, lon=3.1219, ele=12),
        ],
    ),
]
