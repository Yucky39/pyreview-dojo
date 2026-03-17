-- ===================================================
-- レッスンカタログテーブル（全ユーザー共通コンテンツ）
-- ===================================================

-- lesson_catalog: ユーザー固有の learning_phases とは独立したマスターデータ
CREATE TABLE IF NOT EXISTS public.lesson_catalog (
  id TEXT PRIMARY KEY,  -- 'l-1', 'l-2' など
  title TEXT NOT NULL,
  phase_number INTEGER NOT NULL,
  phase_title TEXT NOT NULL,
  lesson_type TEXT NOT NULL CHECK (lesson_type IN ('theory', 'exercise', 'review')),
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('available', 'locked', 'completed')),
  estimated_minutes INTEGER NOT NULL DEFAULT 30,
  difficulty SMALLINT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  tags TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  content JSONB NOT NULL DEFAULT '{}',  -- { introduction, key_concepts, glossary?, summary }
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- exercise_catalog: lesson_catalog に紐づく演習マスターデータ
CREATE TABLE IF NOT EXISTS public.exercise_catalog (
  id TEXT PRIMARY KEY,  -- 'ex-l1-1' など
  lesson_id TEXT REFERENCES public.lesson_catalog(id) ON DELETE CASCADE NOT NULL,
  exercise_order INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('coding', 'review')),
  prompt TEXT NOT NULL,
  starter_code TEXT,
  hints TEXT[] NOT NULL DEFAULT '{}',
  solution TEXT,
  alternative_solutions JSONB,  -- [{ title, code, description }]
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================
-- RLS ポリシー（全ユーザーが参照可能）
-- ===================================================

ALTER TABLE public.lesson_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view lesson catalog" ON public.lesson_catalog
  FOR SELECT USING (TRUE);

CREATE POLICY "All users can view exercise catalog" ON public.exercise_catalog
  FOR SELECT USING (TRUE);

-- ===================================================
-- インデックス
-- ===================================================

CREATE INDEX IF NOT EXISTS idx_exercise_catalog_lesson_id
  ON public.exercise_catalog (lesson_id);

CREATE INDEX IF NOT EXISTS idx_lesson_catalog_sort_order
  ON public.lesson_catalog (sort_order);

-- ===================================================
-- シードデータ
-- ===================================================

INSERT INTO public.lesson_catalog (id, title, phase_number, phase_title, lesson_type, status, estimated_minutes, difficulty, tags, description, content, sort_order) VALUES

('l-1', 'Python環境構築とHello World', 1, 'Python速習（他言語経験者向け）', 'theory', 'completed', 30, 1,
 ARRAY['環境構築', '基礎'],
 'Python開発環境を整え、最初のプログラムを動かします',
 $json${
   "introduction": "Pythonは読みやすく書きやすい言語です。他言語経験者なら、Pythonの文法はすぐに慣れるはずです。まず環境を整えて、Pythonの「Hello World」を動かしてみましょう。",
   "key_concepts": [
     {
       "title": "Python のインタープリタとREPL",
       "explanation": "Pythonはインタープリタ言語です。`python` コマンドで対話型シェル（REPL）を起動でき、コードをその場で実行して確認できます。",
       "example": "# ターミナルで python と入力すると REPLが起動\n>>> print(\"Hello, World!\")\nHello, World!\n>>> 1 + 2\n3\n>>> exit()  # 終了"
     },
     {
       "title": "スクリプトファイルの実行",
       "explanation": "`.py` 拡張子のファイルにコードを書き、`python ファイル名.py` で実行します。他言語と違い、main関数が必須ではありません。",
       "example": "# hello.py\nprint(\"Hello, World!\")\nprint(\"Pythonへようこそ！\")\n\n# ターミナルで実行:\n# python hello.py"
     },
     {
       "title": "コメントと docstring",
       "explanation": "Pythonのコメントは `#` で始まります。関数やクラスの説明には三重引用符（docstring）を使います。",
       "example": "# これは単行コメント\n\ndef greet(name: str) -> str:\n    \"\"\"名前を受け取り、挨拶文を返す。\n\n    Args:\n        name: 挨拶する相手の名前\n    Returns:\n        挨拶文字列\n    \"\"\"\n    return f\"こんにちは、{name}さん！\""
     }
   ],
   "summary": "Pythonの環境構築は他言語より簡単です。REPL を使って素早く実験し、スクリプトファイルで本格的なコードを書きましょう。"
 }$json$::jsonb,
 10),

('l-2', '変数・データ型・演算子', 1, 'Python速習（他言語経験者向け）', 'theory', 'completed', 45, 1,
 ARRAY['変数', 'データ型'],
 'Pythonの変数と主要なデータ型、演算子を学びます',
 $json${
   "introduction": "Pythonは動的型付け言語ですが、型ヒントを使うことで読みやすいコードが書けます。他言語と比較しながら、Pythonのデータ型の特徴を理解しましょう。",
   "key_concepts": [
     {
       "title": "動的型付けと型ヒント",
       "explanation": "Pythonは変数宣言不要で、型は自動推論されます。ただしPython 3.5以降は型ヒントを付けることが推奨されています。型ヒントは実行時には無視されますが、IDE支援やドキュメント性が向上します。",
       "example": "# 型ヒントなし（動作はする）\nname = \"田中\"\nage = 25\n\n# 型ヒントあり（推奨）\nname: str = \"田中\"\nage: int = 25\nscore: float = 98.5\nis_active: bool = True"
     },
     {
       "title": "主要なデータ型",
       "explanation": "Pythonの基本型はstr、int、float、bool、None。None は他言語の null/nil に相当します。",
       "example": "text: str = \"こんにちは\"\nnumber: int = 42\npi: float = 3.14159\nflag: bool = True\nnothing = None\n\nprint(type(text))   # <class 'str'>\nage_int = int(\"25\") # str → int"
     },
     {
       "title": "文字列操作",
       "explanation": "Pythonの文字列は豊富なメソッドを持ちます。f文字列（f-string）は最もPythonicな文字列フォーマット方法です。",
       "example": "name = \"Python\"\nversion = 3.12\nmsg = f\"{name} {version} へようこそ！\"\n\ntext = \"  Hello, World!  \"\nprint(text.strip())\nprint(text.lower())\nprint(\"World\" in text)  # True"
     }
   ],
   "glossary": [
     {
       "term": "動的型付け",
       "definition": "変数の型を事前に宣言せず、実行時に自動的に決定される言語の性質。Pythonは動的型付け言語です。",
       "example": "x = 42  # int\nx = \"hello\"  # 同じ変数にstrを再代入できる"
     },
     {
       "term": "型ヒント（Type Hint）",
       "definition": "Python 3.5以降で使える変数・引数・戻り値の型を明示する記法。実行時には無視されるが、IDEや静的解析ツールが活用します。",
       "example": "def greet(name: str) -> str:\n    return f\"Hello, {name}\""
     },
     {
       "term": "f文字列（f-string）",
       "definition": "Python 3.6以降で使える文字列フォーマット方法。文字列の前に f を付け、{} 内に式を書くと展開されます。",
       "example": "name = \"田中\"\nprint(f\"こんにちは、{name}さん！\")"
     }
   ],
   "summary": "Pythonの型は柔軟ですが、型ヒントを活用して意図を明示しましょう。f文字列は可読性が高く、積極的に使うべきです。"
 }$json$::jsonb,
 20),

('l-3', '制御フロー（if, for, while）', 1, 'Python速習（他言語経験者向け）', 'theory', 'completed', 45, 1,
 ARRAY['制御構造', 'ループ'],
 'Pythonの条件分岐とループ構文を習得します',
 $json${
   "introduction": "Pythonの制御フローは他言語と似ていますが、インデントが構造を決定する点が特徴です。また、for文がイテレータベースで非常に柔軟です。",
   "key_concepts": [
     {
       "title": "if文とWalrus演算子",
       "explanation": "Pythonのif文はシンプルです。三項演算子も使えます。Python 3.8以降はWalrus演算子（:=）で代入と条件判定を同時に行えます。",
       "example": "score = 85\nif score >= 90:\n    grade = \"A\"\nelif score >= 70:\n    grade = \"B\"\nelse:\n    grade = \"C\"\n\n# 三項演算子\ngrade = \"合格\" if score >= 60 else \"不合格\""
     },
     {
       "title": "for文とrange",
       "explanation": "Pythonのfor文はイテラブルを直接ループします。enumerate()でインデックス付き、zip()で複数リスト同時ループが可能です。",
       "example": "fruits = [\"りんご\", \"バナナ\", \"みかん\"]\nfor fruit in fruits:\n    print(fruit)\n\nfor i, fruit in enumerate(fruits):\n    print(f\"{i}: {fruit}\")\n\nfor i in range(1, 6):\n    print(i)"
     },
     {
       "title": "break, continue, else",
       "explanation": "Pythonではfor/whileループにelse節を付けられます。break で抜けなかった場合に実行されます。これはPython独自の機能です。",
       "example": "target = 7\nfor n in range(1, 10):\n    if n == target:\n        print(f\"{target} を発見！\")\n        break\nelse:\n    print(f\"{target} は見つかりませんでした\")"
     }
   ],
   "glossary": [
     {
       "term": "イテラブル（Iterable）",
       "definition": "for文でループできるオブジェクト。list, tuple, str, dict, set, range などが該当します。",
       "example": "for x in [1, 2, 3]:\n    print(x)"
     },
     {
       "term": "enumerate()",
       "definition": "イテラブルの要素にインデックスを付けて返す組み込み関数。(index, value) のタプルを生成します。",
       "example": "for i, v in enumerate([\"a\", \"b\", \"c\"]):\n    print(i, v)  # 0 a, 1 b, 2 c"
     },
     {
       "term": "Walrus演算子（:=）",
       "definition": "Python 3.8以降で使える「代入式」演算子。条件式の中で変数に値を代入しながら評価できます。",
       "example": "if n := len(data):\n    print(f\"データが{n}件あります\")"
     }
   ],
   "summary": "for文はイテラブルを直接扱い、enumerate/zipで柔軟なループを実現できます。ループのelse節はPython独自の強力な機能です。"
 }$json$::jsonb,
 30),

('l-4', '関数とスコープ', 1, 'Python速習（他言語経験者向け）', 'theory', 'completed', 60, 2,
 ARRAY['関数', 'スコープ'],
 'Pythonの関数定義、引数の種類、スコープを理解します',
 $json${
   "introduction": "Pythonの関数は非常に柔軟です。デフォルト引数、キーワード引数、可変長引数など多彩な引数の形式があります。型ヒントと組み合わせることで、安全で読みやすい関数が書けます。",
   "key_concepts": [
     {
       "title": "引数の種類",
       "explanation": "Pythonは位置引数、キーワード引数、デフォルト引数、*args、**kwargsをサポートします。",
       "example": "def greet(\n    name: str,\n    greeting: str = \"こんにちは\",\n    *,  # これ以降はキーワード専用\n    punctuation: str = \"！\",\n) -> str:\n    return f\"{greeting}、{name}{punctuation}\"\n\nprint(greet(\"田中\"))                    # こんにちは、田中！\nprint(greet(\"鈴木\", \"おはよう\"))        # おはよう、鈴木！"
     },
     {
       "title": "可変長引数と型ヒント",
       "explanation": "*args はタプル、**kwargs は辞書として受け取ります。",
       "example": "from typing import Any\n\ndef log_event(event: str, *tags: str, **metadata: Any) -> None:\n    print(f\"[{event}] tags={tags} metadata={metadata}\")\n\nlog_event(\"login\", \"auth\", \"user\", user_id=42, ip=\"127.0.0.1\")"
     },
     {
       "title": "スコープとクロージャ",
       "explanation": "Pythonのスコープ規則はLEGB（Local, Enclosing, Global, Built-in）。クロージャは外側の変数を「閉じ込める」関数です。",
       "example": "def make_counter(start: int = 0):\n    count = start\n\n    def increment(step: int = 1) -> int:\n        nonlocal count\n        count += step\n        return count\n\n    return increment\n\ncounter = make_counter(10)\nprint(counter())    # 11\nprint(counter(5))   # 16"
     }
   ],
   "glossary": [
     {
       "term": "デフォルト引数",
       "definition": "関数定義で引数にデフォルト値を設定すること。呼び出し時に省略可能になります。",
       "example": "def greet(name: str, greeting: str = \"こんにちは\") -> str:\n    return f\"{greeting}、{name}\""
     },
     {
       "term": "キーワード専用引数",
       "definition": "関数定義で * の後に書かれた引数。呼び出し時にキーワード引数として必ず指定する必要があります。",
       "example": "def func(a, *, b):  # bはキーワード専用\n    pass\nfunc(1, b=2)  # OK\nfunc(1, 2)    # エラー"
     },
     {
       "term": "クロージャ",
       "definition": "外側の関数のスコープにある変数を「閉じ込めた」内側の関数。外側の関数が返された後も変数の値を保持します。",
       "example": "def make_adder(n):\n    def add(x):\n        return x + n\n    return add\nadd5 = make_adder(5)\nprint(add5(3))  # 8"
     },
     {
       "term": "nonlocal",
       "definition": "ネストされた関数から外側の関数の変数を変更するためのキーワード。",
       "example": "def outer():\n    x = 0\n    def inner():\n        nonlocal x\n        x += 1\n    inner()\n    return x  # 1"
     }
   ],
   "summary": "関数の引数は柔軟に設定でき、*演算子でキーワード専用引数を強制できます。クロージャとnonlocalを使ってステートを管理できます。"
 }$json$::jsonb,
 40),

('l-5', 'リスト、タプル、辞書、セット', 1, 'Python速習（他言語経験者向け）', 'exercise', 'completed', 60, 2,
 ARRAY['コレクション', 'データ構造'],
 'Pythonの主要なコレクション型とその操作方法を習得します',
 $json${
   "introduction": "Pythonのコレクション型（list, tuple, dict, set）は非常に強力です。適切な型を選ぶことがPythonicなコードの第一歩です。",
   "key_concepts": [
     {
       "title": "list と tuple の使い分け",
       "explanation": "listは変更可能（mutable）、tupleは変更不可（immutable）。変更しないデータにはtupleを使うと意図が明確になります。",
       "example": "scores: list[int] = [85, 92, 78, 95]\nscores.append(88)\nscores.sort(reverse=True)\n\npoint: tuple[int, int] = (10, 20)\nx, y = point  # アンパック"
     },
     {
       "title": "dict の高度な操作",
       "explanation": "dictはキーと値のマッピング。get()でデフォルト値指定、defaultdictで欠損キー自動生成ができます。",
       "example": "from collections import defaultdict\n\nuser: dict[str, str | int] = {\"name\": \"田中\", \"age\": 25}\nemail = user.get(\"email\", \"未登録\")\n\nsquares = {n: n**2 for n in range(1, 6)}"
     },
     {
       "title": "set の活用",
       "explanation": "setは重複を許さないコレクション。集合演算（和集合、積集合、差集合）がO(1)で行えます。",
       "example": "tags = [\"python\", \"web\", \"python\", \"api\"]\nunique_tags = list(set(tags))\n\npython_devs = {\"田中\", \"鈴木\", \"佐藤\"}\njs_devs = {\"山田\", \"鈴木\", \"高橋\"}\nboth = python_devs & js_devs  # 積集合"
     }
   ],
   "glossary": [
     {
       "term": "ミュータブル（Mutable）",
       "definition": "作成後に内容を変更できるオブジェクト。list, dict, set などが該当します。",
       "example": "lst = [1, 2, 3]\nlst.append(4)  # 変更可能"
     },
     {
       "term": "イミュータブル（Immutable）",
       "definition": "作成後に内容を変更できないオブジェクト。tuple, str, int などが該当します。",
       "example": "t = (1, 2, 3)\n# t[0] = 99  # TypeError になる"
     },
     {
       "term": "アンパック（Unpacking）",
       "definition": "シーケンスやイテラブルの要素を複数の変数に一度に代入する操作。",
       "example": "x, y = (10, 20)\na, *rest = [1, 2, 3, 4]  # 残りをリストに"
     },
     {
       "term": "defaultdict",
       "definition": "collections モジュールのdict派生クラス。存在しないキーへのアクセス時にデフォルト値を自動生成します。",
       "example": "from collections import defaultdict\nd = defaultdict(int)\nd[\"x\"] += 1  # KeyErrorにならない"
     }
   ],
   "summary": "変更しないデータにはtuple、重複なし集合にはset、キーバリューにはdict。適切なコレクション型の選択がPythonicなコードの基本です。"
 }$json$::jsonb,
 50),

('l-6', 'クラスとオブジェクト指向', 1, 'Python速習（他言語経験者向け）', 'theory', 'available', 75, 3,
 ARRAY['OOP', 'クラス'],
 'Pythonのクラスとオブジェクト指向プログラミングの基礎を学びます',
 $json${
   "introduction": "Pythonのクラスは他の言語と似た概念ですが、独自の特徴があります。__init__、self、継承など、Pythonらしいクラスの書き方を学びましょう。",
   "key_concepts": [
     {
       "title": "クラスの定義と__init__",
       "explanation": "Pythonではclassキーワードでクラスを定義します。コンストラクタは__init__メソッドで定義し、第一引数にselfを受け取ります。",
       "example": "class Dog:\n    def __init__(self, name: str, age: int):\n        self.name = name\n        self.age = age\n\n    def bark(self) -> str:\n        return f\"{self.name}が吠えた！\"\n\ndog = Dog(\"ポチ\", 3)\nprint(dog.bark())"
     },
     {
       "title": "データクラス（dataclass）",
       "explanation": "Python 3.7以降では@dataclassデコレータを使うことで、ボイラープレートコードを減らせます。",
       "example": "from dataclasses import dataclass, field\n\n@dataclass\nclass Student:\n    name: str\n    grade: int\n    scores: list[int] = field(default_factory=list)\n\n    @property\n    def average(self) -> float:\n        return sum(self.scores) / len(self.scores) if self.scores else 0.0"
     },
     {
       "title": "継承とsuper()",
       "explanation": "Pythonの継承はシンプルで直感的です。super()を使って親クラスのメソッドを呼び出せます。",
       "example": "class Animal:\n    def __init__(self, name: str):\n        self.name = name\n\nclass Cat(Animal):\n    def speak(self) -> str:\n        return f\"{self.name}がニャーと鳴いた\"\n\nclass Dog(Animal):\n    def speak(self) -> str:\n        return f\"{self.name}がワンと吠えた\""
     }
   ],
   "glossary": [
     {
       "term": "__init__",
       "definition": "クラスのコンストラクタメソッド。インスタンス生成時に自動的に呼び出されます。",
       "example": "class Dog:\n    def __init__(self, name: str):\n        self.name = name"
     },
     {
       "term": "self",
       "definition": "インスタンスメソッドの第一引数。インスタンス自身を参照するための慣習的な名前です。",
       "example": "class Counter:\n    def __init__(self):\n        self.count = 0\n    def increment(self):\n        self.count += 1"
     },
     {
       "term": "@dataclass",
       "definition": "Python 3.7以降で使えるデコレータ。__init__, __repr__, __eq__ などを自動生成し、ボイラープレートコードを削減します。",
       "example": "from dataclasses import dataclass\n@dataclass\nclass Point:\n    x: float\n    y: float"
     },
     {
       "term": "super()",
       "definition": "親クラスを参照する組み込み関数。子クラスから親クラスのメソッドを呼び出す際に使います。",
       "example": "class Child(Parent):\n    def __init__(self, x, y):\n        super().__init__(x)\n        self.y = y"
     }
   ],
   "summary": "Pythonのクラスは強力で柔軟です。dataclassを使ってボイラープレートを削減し、型ヒントを活用して読みやすいコードを書きましょう。"
 }$json$::jsonb,
 60),

('l-7', 'エラーハンドリングと例外', 1, 'Python速習（他言語経験者向け）', 'theory', 'locked', 45, 2,
 ARRAY['例外処理'],
 'Pythonの例外処理とエラーハンドリングを学びます',
 '{}'::jsonb,
 70),

('l-8', 'リスト内包表記とジェネレータ', 1, 'Python速習（他言語経験者向け）', 'exercise', 'locked', 60, 3,
 ARRAY['内包表記', 'Pythonic'],
 'Pythonらしいリスト内包表記とジェネレータを習得します',
 '{}'::jsonb,
 80),

('l-9', 'ファイル操作とパス処理', 2, '標準ライブラリ活用', 'theory', 'locked', 45, 2,
 ARRAY['ファイル', 'pathlib'],
 'Pythonでのファイル読み書きとパス操作を学びます',
 '{}'::jsonb,
 90),

('l-10', '正規表現', 2, '標準ライブラリ活用', 'exercise', 'locked', 60, 3,
 ARRAY['正規表現', 're'],
 'Python の re モジュールを使った正規表現処理を習得します',
 '{}'::jsonb,
 100)

ON CONFLICT (id) DO NOTHING;

-- ===================================================
-- 演習シードデータ
-- ===================================================

INSERT INTO public.exercise_catalog (id, lesson_id, exercise_order, title, exercise_type, prompt, starter_code, hints, solution, alternative_solutions) VALUES

('ex-l1-1', 'l-1', 1, '自己紹介プログラム', 'coding',
 '名前、年齢、好きなプログラミング言語を表示する自己紹介プログラムを作成してください。

要件:
- 3行以上の情報を表示する
- f文字列を使用する
- 型ヒントを付けた関数にまとめる',
 'def introduce(name: str, age: int, language: str) -> str:
    """自己紹介文を返す関数"""
    # ここに実装してください
    pass


# メイン処理
result = introduce("田中太郎", 25, "Python")
print(result)',
 ARRAY[
   'f文字列は f"テキスト{変数}テキスト" の形式で使います',
   '改行は \n または print() を複数回呼ぶことで表現できます'
 ],
 'def introduce(name: str, age: int, language: str) -> str:
    """自己紹介文を返す関数"""
    return f"名前: {name}\n年齢: {age}歳\n好きな言語: {language}"


result = introduce("田中太郎", 25, "Python")
print(result)',
 $json$[
   {
     "title": "複数のprint()を使う方法",
     "code": "def introduce(name: str, age: int, language: str) -> None:\n    \"\"\"自己紹介を表示する関数\"\"\"\n    print(f\"名前: {name}\")\n    print(f\"年齢: {age}歳\")\n    print(f\"好きな言語: {language}\")\n\nintroduce(\"田中太郎\", 25, \"Python\")",
     "description": "戻り値を持たせず、直接 print() で出力する書き方。用途によってはこちらの方がシンプルです。"
   }
 ]$json$::jsonb),

('ex-l2-1', 'l-2', 1, '型変換と文字列フォーマット', 'coding',
 '以下の処理を実装してください。

要件:
1. 文字列の数値リスト ["1", "2", "3", "4", "5"] をint型のリストに変換する
2. その合計と平均をf文字列で表示する
3. 型ヒントを付ける',
 'from typing import List

def process_numbers(str_nums: List[str]) -> None:
    """文字列の数値リストを処理して統計を表示する"""
    # ここに実装してください
    pass


process_numbers(["1", "2", "3", "4", "5"])
# 期待出力:
# 合計: 15
# 平均: 3.0',
 ARRAY[
   'リスト内包表記 [int(x) for x in str_nums] を使いましょう',
   'sum() と len() で合計と平均が計算できます'
 ],
 'from typing import List

def process_numbers(str_nums: List[str]) -> None:
    """文字列の数値リストを処理して統計を表示する"""
    nums = [int(x) for x in str_nums]
    total = sum(nums)
    average = total / len(nums)
    print(f"合計: {total}")
    print(f"平均: {average}")


process_numbers(["1", "2", "3", "4", "5"])',
 $json$[
   {
     "title": "map() を使う方法",
     "code": "from typing import List\n\ndef process_numbers(str_nums: List[str]) -> None:\n    nums = list(map(int, str_nums))\n    print(f\"合計: {sum(nums)}\")\n    print(f\"平均: {sum(nums) / len(nums)}\")\n\nprocess_numbers([\"1\", \"2\", \"3\", \"4\", \"5\"])",
     "description": "リスト内包表記の代わりに map() を使う方法。関数型プログラミングのスタイルです。"
   }
 ]$json$::jsonb),

('ex-l3-1', 'l-3', 1, 'FizzBuzz', 'coding',
 '1から100までの数を表示するFizzBuzzを実装してください。

要件:
- 3の倍数は "Fizz"
- 5の倍数は "Buzz"
- 両方の倍数は "FizzBuzz"
- それ以外は数字
- リスト内包表記を使う（ループより推奨）',
 'from typing import List

def fizzbuzz(n: int) -> List[str]:
    """1からnまでのFizzBuzz結果をリストで返す"""
    # ここに実装してください
    pass


result = fizzbuzz(100)
print("\n".join(result))',
 ARRAY[
   'まずforループで実装し、その後リスト内包表記に変換してみましょう',
   '条件の判定順序に注意: FizzBuzzを先に判定する必要があります'
 ],
 'from typing import List

def fizzbuzz(n: int) -> List[str]:
    """1からnまでのFizzBuzz結果をリストで返す"""
    return [
        "FizzBuzz" if i % 15 == 0
        else "Fizz" if i % 3 == 0
        else "Buzz" if i % 5 == 0
        else str(i)
        for i in range(1, n + 1)
    ]


result = fizzbuzz(100)
print("\n".join(result))',
 $json$[
   {
     "title": "forループを使う方法",
     "code": "from typing import List\n\ndef fizzbuzz(n: int) -> List[str]:\n    result = []\n    for i in range(1, n + 1):\n        if i % 15 == 0:\n            result.append(\"FizzBuzz\")\n        elif i % 3 == 0:\n            result.append(\"Fizz\")\n        elif i % 5 == 0:\n            result.append(\"Buzz\")\n        else:\n            result.append(str(i))\n    return result",
     "description": "古典的なforループによる実装。読みやすさを重視する場合はこちらも良い選択肢です。"
   },
   {
     "title": "文字列結合を使う方法",
     "code": "from typing import List\n\ndef fizzbuzz(n: int) -> List[str]:\n    result = []\n    for i in range(1, n + 1):\n        s = \"\"\n        if i % 3 == 0:\n            s += \"Fizz\"\n        if i % 5 == 0:\n            s += \"Buzz\"\n        result.append(s or str(i))\n    return result",
     "description": "文字列を積み上げる方法。FizzBuzzの判定が自動的に処理されるため、条件の順番を気にしなくて済みます。"
   }
 ]$json$::jsonb),

('ex-l4-1', 'l-4', 1, '汎用的な集計関数', 'coding',
 '数値のリストを受け取り、統計情報を辞書で返す関数を実装してください。

要件:
- count, sum, min, max, average を含む辞書を返す
- 空リストの場合は適切に処理する
- 型ヒントを付ける',
 'from typing import List, Dict, Union

def calculate_stats(numbers: List[float]) -> Dict[str, Union[int, float, None]]:
    """数値リストの統計情報を返す"""
    # ここに実装してください
    pass


print(calculate_stats([1, 2, 3, 4, 5]))
# {''count'': 5, ''sum'': 15.0, ''min'': 1, ''max'': 5, ''average'': 3.0}

print(calculate_stats([]))
# {''count'': 0, ''sum'': 0, ''min'': None, ''max'': None, ''average'': None}',
 ARRAY[
   '組み込み関数 sum(), min(), max(), len() を活用しましょう',
   '空リストの場合は min/max/average を None で返しましょう'
 ],
 'from typing import List, Dict, Union

def calculate_stats(numbers: List[float]) -> Dict[str, Union[int, float, None]]:
    """数値リストの統計情報を返す"""
    count = len(numbers)
    if count == 0:
        return {"count": 0, "sum": 0, "min": None, "max": None, "average": None}
    total = sum(numbers)
    return {
        "count": count,
        "sum": total,
        "min": min(numbers),
        "max": max(numbers),
        "average": total / count,
    }


print(calculate_stats([1, 2, 3, 4, 5]))
print(calculate_stats([]))',
 $json$[
   {
     "title": "statistics モジュールを使う方法",
     "code": "from typing import List, Dict, Union\nimport statistics\n\ndef calculate_stats(numbers: List[float]) -> Dict[str, Union[int, float, None]]:\n    if not numbers:\n        return {\"count\": 0, \"sum\": 0, \"min\": None, \"max\": None, \"average\": None}\n    return {\n        \"count\": len(numbers),\n        \"sum\": sum(numbers),\n        \"min\": min(numbers),\n        \"max\": max(numbers),\n        \"average\": statistics.mean(numbers),\n    }",
     "description": "標準ライブラリの statistics モジュールを使う方法。より厳密な統計計算が必要な場合に便利です。"
   }
 ]$json$::jsonb),

('ex-l5-1', 'l-5', 1, '単語カウンター', 'coding',
 'テキストから単語の出現回数をカウントする関数を実装してください。

要件:
- 大文字小文字を区別しない
- 出現回数が多い順に返す
- 上位N件のみ返すオプション引数を持つ',
 'from typing import Optional

def count_words(
    text: str,
    top_n: Optional[int] = None
) -> list[tuple[str, int]]:
    """テキストの単語出現回数を集計する。

    Returns:
        (単語, 出現回数) のタプルのリスト（出現回数の降順）
    """
    # ここに実装してください
    pass


text = "the quick brown fox jumps over the lazy dog the fox"
print(count_words(text, top_n=3))',
 ARRAY[
   'text.lower().split() で単語のリストを取得できます',
   'collections.Counter を使うと簡単に実装できます',
   'Counter.most_common(n) で上位N件を取得できます'
 ],
 'from typing import Optional
from collections import Counter

def count_words(
    text: str,
    top_n: Optional[int] = None
) -> list[tuple[str, int]]:
    """テキストの単語出現回数を集計する。"""
    words = text.lower().split()
    counter = Counter(words)
    return counter.most_common(top_n)


text = "the quick brown fox jumps over the lazy dog the fox"
print(count_words(text, top_n=3))',
 $json$[
   {
     "title": "dict を使って手動でカウントする方法",
     "code": "from typing import Optional\n\ndef count_words(\n    text: str,\n    top_n: Optional[int] = None\n) -> list[tuple[str, int]]:\n    counts: dict[str, int] = {}\n    for word in text.lower().split():\n        counts[word] = counts.get(word, 0) + 1\n    sorted_items = sorted(counts.items(), key=lambda x: x[1], reverse=True)\n    return sorted_items[:top_n]",
     "description": "Counter を使わず dict で手動実装する方法。標準ライブラリへの依存なしに動作します。"
   }
 ]$json$::jsonb),

('ex-l6-1', 'l-6', 1, 'クラスの実装', 'coding',
 '銀行口座を表すBankAccountクラスを実装してください。

要件:
- 残高(balance)を持つ
- deposit(amount)で入金
- withdraw(amount)で出金（残高不足時はValueErrorを発生させる）
- 取引履歴(transactions)を記録する',
 'from dataclasses import dataclass, field
from typing import List

@dataclass
class BankAccount:
    owner: str
    balance: float = 0.0
    transactions: List[dict] = field(default_factory=list)

    def deposit(self, amount: float) -> None:
        # ここに実装
        pass

    def withdraw(self, amount: float) -> None:
        # ここに実装
        pass


# テスト
account = BankAccount("田中太郎")
account.deposit(10000)
account.withdraw(3000)
print(account.balance)  # 7000.0
print(account.transactions)',
 ARRAY[
   'depositはbalanceに加算するだけ',
   'withdrawはbalanceが不足する場合ValueError("残高不足")を発生させる',
   'transactionsには{"type": "deposit", "amount": 金額}の形式で追加する'
 ],
 'from dataclasses import dataclass, field
from typing import List

@dataclass
class BankAccount:
    owner: str
    balance: float = 0.0
    transactions: List[dict] = field(default_factory=list)

    def deposit(self, amount: float) -> None:
        self.balance += amount
        self.transactions.append({"type": "deposit", "amount": amount})

    def withdraw(self, amount: float) -> None:
        if amount > self.balance:
            raise ValueError("残高不足")
        self.balance -= amount
        self.transactions.append({"type": "withdraw", "amount": amount})


account = BankAccount("田中太郎")
account.deposit(10000)
account.withdraw(3000)
print(account.balance)
print(account.transactions)',
 $json$[
   {
     "title": "dataclassを使わない実装",
     "code": "class BankAccount:\n    def __init__(self, owner: str, balance: float = 0.0):\n        self.owner = owner\n        self.balance = balance\n        self.transactions: list[dict] = []\n\n    def deposit(self, amount: float) -> None:\n        self.balance += amount\n        self.transactions.append({\"type\": \"deposit\", \"amount\": amount})\n\n    def withdraw(self, amount: float) -> None:\n        if amount > self.balance:\n            raise ValueError(\"残高不足\")\n        self.balance -= amount\n        self.transactions.append({\"type\": \"withdraw\", \"amount\": amount})",
     "description": "@dataclass を使わず __init__ を明示的に書く方法。シンプルで理解しやすいです。"
   }
 ]$json$::jsonb),

('ex-l6-2', 'l-6', 2, 'コードレビュー演習', 'review',
 '以下のPythonコードをレビューしてください。改善点とその理由を具体的に説明してください。

```python
class user:
    def __init__(self, n, a, e):
        self.n = n
        self.a = a
        self.e = e

    def get_info(self):
        return "Name: " + self.n + ", Age: " + str(self.a) + ", Email: " + self.e

    def update_age(self, new_age):
        self.a = new_age
        return self

u = user("田中", 25, "tanaka@example.com")
print(u.get_info())
```',
 NULL,
 ARRAY[
   'クラス名の命名規則（PEP8）を確認しよう',
   '変数名の読みやすさを考えよう',
   '文字列の連結よりも効率的な方法がある',
   '型ヒントの追加を検討しよう'
 ],
 NULL,
 NULL)

ON CONFLICT (id) DO NOTHING;
