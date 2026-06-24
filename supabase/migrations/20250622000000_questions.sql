-- Reflectievragen-catalogus voor AI-agent (14 psychologische vragen)

CREATE TABLE public.questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category text NOT NULL,
    framework text NOT NULL,
    question_text text NOT NULL,
    CONSTRAINT questions_category_check CHECK (
        category IN ('stress_angst', 'patronen', 'intenties', 'emotieregulatie')
    ),
    CONSTRAINT questions_framework_check CHECK (
        framework IN ('cbt', 'groei_reflectie', 'gedragsactivatie', 'act')
    )
);

COMMENT ON TABLE public.questions IS
    'Gedeelde catalogus van reflectievragen voor de Lumina AI-agent.';
COMMENT ON COLUMN public.questions.category IS
    'Thematische categorie: stress_angst, patronen, intenties, emotieregulatie.';
COMMENT ON COLUMN public.questions.framework IS
    'Therapeutisch kader: cbt, groei_reflectie, gedragsactivatie, act.';

CREATE INDEX questions_category_framework_idx
    ON public.questions (category, framework);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read questions"
    ON public.questions FOR SELECT
    TO authenticated
    USING (true);

GRANT SELECT ON public.questions TO authenticated;
GRANT ALL ON public.questions TO postgres, service_role;

INSERT INTO public.questions (category, framework, question_text)
VALUES
    (
        'stress_angst',
        'cbt',
        'Welke gedachte houdt je op dit moment het meest bezig, en welk bewijs heb je dat deze gedachte 100% waar is?'
    ),
    (
        'stress_angst',
        'cbt',
        'Als een goede vriend(in) in exact dezelfde situatie zou zitten met dezelfde stress, welk advies zou je hem of haar dan geven?'
    ),
    (
        'stress_angst',
        'cbt',
        'Wat ligt er op dit moment écht binnen jouw controle, en wat probeer je te controleren waar je eigenlijk geen invloed op hebt?'
    ),
    (
        'stress_angst',
        'cbt',
        'Schrijf het absolute worst-case scenario op dat nu in je hoofd zit. Wat zou je doen als dit écht gebeurt? Hoe overleef je dat?'
    ),
    (
        'patronen',
        'groei_reflectie',
        'Wanneer voelde je je vandaag het meest energiek of juist het meest leeggezogen? Wat of wie veroorzaakte die omslag?'
    ),
    (
        'patronen',
        'groei_reflectie',
        'Merk je dat de situatie van vandaag je doet denken aan een ervaring uit je verleden? Welke ''ongeschreven regel'' ben je nu aan het volgen?'
    ),
    (
        'patronen',
        'groei_reflectie',
        'Wat probeer je op dit moment te vermijden door zo druk te zijn of je hier zo intens op te focussen?'
    ),
    (
        'patronen',
        'groei_reflectie',
        'Als je de situatie van vandaag vanuit een helikoptervlucht bekijkt, welk aandeel had jij dan zelf in het verloop ervan?'
    ),
    (
        'intenties',
        'gedragsactivatie',
        'Welke kleine, concrete actie van maximaal 5 minuten kun je morgen doen om een stapje dichter bij je doel te komen?'
    ),
    (
        'intenties',
        'gedragsactivatie',
        'Wat hield je vandaag tegen om je aan je voorgenomen intentie te houden, en hoe kun je die drempel morgen lager maken?'
    ),
    (
        'intenties',
        'gedragsactivatie',
        'Als je kijkt naar je weekdoel, op welk moment van de dag was je daar vandaag bewust mee bezig?'
    ),
    (
        'emotieregulatie',
        'act',
        'Als je de emotie die je nu voelt een vorm, kleur of textuur zou moeten geven, hoe ziet die er dan uit?'
    ),
    (
        'emotieregulatie',
        'act',
        'Welk gevoel probeer je op dit moment weg te duwen? Wat gebeurt er als je er simpelweg een paar minuten naar kijkt en het er laat zijn?'
    ),
    (
        'emotieregulatie',
        'act',
        'Wat zegt deze specifieke frustratie of pijn over wat jij écht belangrijk vindt in het leven (jouw kernwaarden)?'
    );
