// ===== 共有レッスンデータ =====
// lessons/page.tsx と lessons/[id]/page.tsx で共有

export type LessonStatus = 'completed' | 'available' | 'locked';
export type LessonType = 'theory' | 'exercise' | 'review';

export interface LessonMeta {
  id: string;
  title: string;
  phase: number;
  phase_title: string;
  type: LessonType;
  status: LessonStatus;
  estimated_minutes: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
}

export interface LessonExercise {
  id: string;
  title: string;
  type: 'coding' | 'review';
  prompt: string;
  starter_code?: string;
  hints: string[];
}

export interface LessonContent {
  introduction: string;
  key_concepts: Array<{
    title: string;
    explanation: string;
    example?: string;
  }>;
  summary: string;
}

export interface LessonDetail extends LessonMeta {
  description: string;
  content: LessonContent;
  exercises: LessonExercise[];
}

// ===== レッスン一覧メタデータ =====

export const LESSONS: LessonMeta[] = [
  {
    id: 'l-1',
    title: 'Python環境構築とHello World',
    phase: 1,
    phase_title: 'Python速習（他言語経験者向け）',
    type: 'theory',
    status: 'completed',
    estimated_minutes: 30,
    difficulty: 1,
    tags: ['環境構築', '基礎'],
  },
  {
    id: 'l-2',
    title: '変数・データ型・演算子',
    phase: 1,
    phase_title: 'Python速習（他言語経験者向け）',
    type: 'theory',
    status: 'completed',
    estimated_minutes: 45,
    difficulty: 1,
    tags: ['変数', 'データ型'],
  },
  {
    id: 'l-3',
    title: '制御フロー（if, for, while）',
    phase: 1,
    phase_title: 'Python速習（他言語経験者向け）',
    type: 'theory',
    status: 'completed',
    estimated_minutes: 45,
    difficulty: 1,
    tags: ['制御構造', 'ループ'],
  },
  {
    id: 'l-4',
    title: '関数とスコープ',
    phase: 1,
    phase_title: 'Python速習（他言語経験者向け）',
    type: 'theory',
    status: 'completed',
    estimated_minutes: 60,
    difficulty: 2,
    tags: ['関数', 'スコープ'],
  },
  {
    id: 'l-5',
    title: 'リスト、タプル、辞書、セット',
    phase: 1,
    phase_title: 'Python速習（他言語経験者向け）',
    type: 'exercise',
    status: 'completed',
    estimated_minutes: 60,
    difficulty: 2,
    tags: ['コレクション', 'データ構造'],
  },
  {
    id: 'l-6',
    title: 'クラスとオブジェクト指向',
    phase: 1,
    phase_title: 'Python速習（他言語経験者向け）',
    type: 'theory',
    status: 'available',
    estimated_minutes: 75,
    difficulty: 3,
    tags: ['OOP', 'クラス'],
  },
  {
    id: 'l-7',
    title: 'エラーハンドリングと例外',
    phase: 1,
    phase_title: 'Python速習（他言語経験者向け）',
    type: 'theory',
    status: 'locked',
    estimated_minutes: 45,
    difficulty: 2,
    tags: ['例外処理'],
  },
  {
    id: 'l-8',
    title: 'リスト内包表記とジェネレータ',
    phase: 1,
    phase_title: 'Python速習（他言語経験者向け）',
    type: 'exercise',
    status: 'locked',
    estimated_minutes: 60,
    difficulty: 3,
    tags: ['内包表記', 'Pythonic'],
  },
  {
    id: 'l-9',
    title: 'ファイル操作とパス処理',
    phase: 2,
    phase_title: '標準ライブラリ活用',
    type: 'theory',
    status: 'locked',
    estimated_minutes: 45,
    difficulty: 2,
    tags: ['ファイル', 'pathlib'],
  },
  {
    id: 'l-10',
    title: '正規表現',
    phase: 2,
    phase_title: '標準ライブラリ活用',
    type: 'exercise',
    status: 'locked',
    estimated_minutes: 60,
    difficulty: 3,
    tags: ['正規表現', 're'],
  },
];

// ===== レッスン詳細コンテンツ =====

const LESSON_DETAILS: Record<string, LessonDetail> = {
  'l-1': {
    ...LESSONS[0],
    description: 'Python開発環境を整え、最初のプログラムを動かします',
    content: {
      introduction:
        'Pythonは読みやすく書きやすい言語です。他言語経験者なら、Pythonの文法はすぐに慣れるはずです。まず環境を整えて、Pythonの「Hello World」を動かしてみましょう。',
      key_concepts: [
        {
          title: 'Python のインタープリタとREPL',
          explanation:
            'Pythonはインタープリタ言語です。`python` コマンドで対話型シェル（REPL）を起動でき、コードをその場で実行して確認できます。',
          example: `# ターミナルで python と入力すると REPLが起動
>>> print("Hello, World!")
Hello, World!
>>> 1 + 2
3
>>> exit()  # 終了`,
        },
        {
          title: 'スクリプトファイルの実行',
          explanation:
            '`.py` 拡張子のファイルにコードを書き、`python ファイル名.py` で実行します。他言語と違い、main関数が必須ではありません。',
          example: `# hello.py
print("Hello, World!")
print("Pythonへようこそ！")

# ターミナルで実行:
# python hello.py`,
        },
        {
          title: 'コメントと docstring',
          explanation:
            'Pythonのコメントは `#` で始まります。関数やクラスの説明には三重引用符（docstring）を使います。',
          example: `# これは単行コメント

def greet(name: str) -> str:
    """名前を受け取り、挨拶文を返す。

    Args:
        name: 挨拶する相手の名前
    Returns:
        挨拶文字列
    """
    return f"こんにちは、{name}さん！"`,
        },
      ],
      summary:
        'Pythonの環境構築は他言語より簡単です。REPL を使って素早く実験し、スクリプトファイルで本格的なコードを書きましょう。',
    },
    exercises: [
      {
        id: 'ex-l1-1',
        title: '自己紹介プログラム',
        type: 'coding',
        prompt:
          '名前、年齢、好きなプログラミング言語を表示する自己紹介プログラムを作成してください。\n\n要件:\n- 3行以上の情報を表示する\n- f文字列を使用する\n- 型ヒントを付けた関数にまとめる',
        starter_code: `def introduce(name: str, age: int, language: str) -> str:
    """自己紹介文を返す関数"""
    # ここに実装してください
    pass


# メイン処理
result = introduce("田中太郎", 25, "Python")
print(result)`,
        hints: [
          'f文字列は f"テキスト{変数}テキスト" の形式で使います',
          '改行は \\n または print() を複数回呼ぶことで表現できます',
        ],
      },
    ],
  },

  'l-2': {
    ...LESSONS[1],
    description: 'Pythonの変数と主要なデータ型、演算子を学びます',
    content: {
      introduction:
        'Pythonは動的型付け言語ですが、型ヒントを使うことで読みやすいコードが書けます。他言語と比較しながら、Pythonのデータ型の特徴を理解しましょう。',
      key_concepts: [
        {
          title: '動的型付けと型ヒント',
          explanation:
            'Pythonは変数宣言不要で、型は自動推論されます。ただしPython 3.5以降は型ヒントを付けることが推奨されています。型ヒントは実行時には無視されますが、IDE支援やドキュメント性が向上します。',
          example: `# 型ヒントなし（動作はする）
name = "田中"
age = 25
score = 98.5

# 型ヒントあり（推奨）
name: str = "田中"
age: int = 25
score: float = 98.5
is_active: bool = True`,
        },
        {
          title: '主要なデータ型',
          explanation:
            'Pythonの基本型はstr、int、float、bool、None。複合型はlist、tuple、dict、set。None は他言語の null/nil に相当します。',
          example: `# 基本型
text: str = "こんにちは"
number: int = 42
pi: float = 3.14159
flag: bool = True
nothing = None  # NoneType

# 型の確認
print(type(text))   # <class 'str'>
print(type(42))     # <class 'int'>

# 型変換
age_str = "25"
age_int = int(age_str)  # str → int
price = float("1980")   # str → float`,
        },
        {
          title: '文字列操作',
          explanation:
            'Pythonの文字列は豊富なメソッドを持ちます。f文字列（f-string）は最もPythonicな文字列フォーマット方法です。',
          example: `name = "Python"
version = 3.12

# f文字列（推奨）
msg = f"{name} {version} へようこそ！"

# 主なメソッド
text = "  Hello, World!  "
print(text.strip())         # 前後のスペース除去
print(text.lower())         # 小文字化
print(text.replace("H", "h"))  # 置換
print("World" in text)     # 部分一致確認: True
print(text.split(","))     # 分割: ['  Hello', ' World!  ']`,
        },
      ],
      summary:
        'Pythonの型は柔軟ですが、型ヒントを活用して意図を明示しましょう。f文字列は可読性が高く、積極的に使うべきです。',
    },
    exercises: [
      {
        id: 'ex-l2-1',
        title: '型変換と文字列フォーマット',
        type: 'coding',
        prompt:
          '以下の処理を実装してください。\n\n要件:\n1. 文字列の数値リスト ["1", "2", "3", "4", "5"] をint型のリストに変換する\n2. その合計と平均をf文字列で表示する\n3. 型ヒントを付ける',
        starter_code: `from typing import List

def process_numbers(str_nums: List[str]) -> None:
    """文字列の数値リストを処理して統計を表示する"""
    # ここに実装してください
    pass


process_numbers(["1", "2", "3", "4", "5"])
# 期待出力:
# 合計: 15
# 平均: 3.0`,
        hints: [
          'リスト内包表記 [int(x) for x in str_nums] を使いましょう',
          'sum() と len() で合計と平均が計算できます',
        ],
      },
    ],
  },

  'l-3': {
    ...LESSONS[2],
    description: 'Pythonの条件分岐とループ構文を習得します',
    content: {
      introduction:
        'Pythonの制御フローは他言語と似ていますが、インデントが構造を決定する点が特徴です。また、for文がイテレータベースで非常に柔軟です。',
      key_concepts: [
        {
          title: 'if文とWalrus演算子',
          explanation:
            'Pythonのif文はシンプルです。三項演算子も使えます。Python 3.8以降はWalrus演算子（:=）で代入と条件判定を同時に行えます。',
          example: `score = 85

# 通常のif
if score >= 90:
    grade = "A"
elif score >= 70:
    grade = "B"
else:
    grade = "C"

# 三項演算子（Pythonic）
grade = "合格" if score >= 60 else "不合格"

# Walrus演算子
import re
if m := re.search(r"\\d+", "abc123"):
    print(f"数字を発見: {m.group()}")`,
        },
        {
          title: 'for文とrange',
          explanation:
            'Pythonのfor文はイテラブルを直接ループします。enumerate()でインデックス付き、zip()で複数リスト同時ループが可能です。',
          example: `# リストの直接ループ（推奨）
fruits = ["りんご", "バナナ", "みかん"]
for fruit in fruits:
    print(fruit)

# インデックスが必要な場合
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")

# 複数リストの同時ループ
prices = [100, 200, 150]
for fruit, price in zip(fruits, prices):
    print(f"{fruit}: {price}円")

# range
for i in range(1, 6):  # 1〜5
    print(i)`,
        },
        {
          title: 'break, continue, else',
          explanation:
            'Pythonではfor/whileループにelse節を付けられます。break で抜けなかった場合に実行されます。これはPython独自の機能です。',
          example: `# ループのelse（break しなかった場合に実行）
target = 7
for n in range(1, 10):
    if n == target:
        print(f"{target} を発見！")
        break
else:
    print(f"{target} は見つかりませんでした")

# while + continue
count = 0
while count < 10:
    count += 1
    if count % 2 == 0:
        continue  # 偶数はスキップ
    print(count)  # 奇数のみ出力`,
        },
      ],
      summary:
        'for文はイテラブルを直接扱い、enumerate/zipで柔軟なループを実現できます。ループのelse節はPython独自の強力な機能です。',
    },
    exercises: [
      {
        id: 'ex-l3-1',
        title: 'FizzBuzz',
        type: 'coding',
        prompt:
          '1から100までの数を表示するFizzBuzzを実装してください。\n\n要件:\n- 3の倍数は "Fizz"\n- 5の倍数は "Buzz"\n- 両方の倍数は "FizzBuzz"\n- それ以外は数字\n- リスト内包表記を使う（ループより推奨）',
        starter_code: `from typing import List

def fizzbuzz(n: int) -> List[str]:
    """1からnまでのFizzBuzz結果をリストで返す"""
    # ここに実装してください
    pass


result = fizzbuzz(100)
print("\\n".join(result))`,
        hints: [
          'まずforループで実装し、その後リスト内包表記に変換してみましょう',
          '条件の判定順序に注意: FizzBuzzを先に判定する必要があります',
        ],
      },
    ],
  },

  'l-4': {
    ...LESSONS[3],
    description: 'Pythonの関数定義、引数の種類、スコープを理解します',
    content: {
      introduction:
        'Pythonの関数は非常に柔軟です。デフォルト引数、キーワード引数、可変長引数など多彩な引数の形式があります。型ヒントと組み合わせることで、安全で読みやすい関数が書けます。',
      key_concepts: [
        {
          title: '引数の種類',
          explanation:
            'Pythonは位置引数、キーワード引数、デフォルト引数、*args、**kwargsをサポートします。これらを組み合わせて柔軟なAPIが設計できます。',
          example: `def greet(
    name: str,
    greeting: str = "こんにちは",  # デフォルト引数
    *,  # これ以降はキーワード専用
    punctuation: str = "！",
) -> str:
    return f"{greeting}、{name}{punctuation}"

# 使用例
print(greet("田中"))                    # こんにちは、田中！
print(greet("鈴木", "おはよう"))        # おはよう、鈴木！
print(greet("佐藤", punctuation="。")) # こんにちは、佐藤。`,
        },
        {
          title: '可変長引数と型ヒント',
          explanation:
            '*args はタプル、**kwargs は辞書として受け取ります。Python 3.9以降は組み込み型をそのまま型ヒントに使えます。',
          example: `from typing import Any

def log_event(event: str, *tags: str, **metadata: Any) -> None:
    """イベントをログに記録する"""
    print(f"[{event}] tags={tags} metadata={metadata}")

log_event("login", "auth", "user", user_id=42, ip="127.0.0.1")
# [login] tags=('auth', 'user') metadata={'user_id': 42, 'ip': '127.0.0.1'}`,
        },
        {
          title: 'スコープとクロージャ',
          explanation:
            'Pythonのスコープ規則はLEGB（Local, Enclosing, Global, Built-in）。クロージャは外側の変数を「閉じ込める」関数です。',
          example: `def make_counter(start: int = 0):
    """カウンターを生成するファクトリ関数（クロージャの例）"""
    count = start

    def increment(step: int = 1) -> int:
        nonlocal count  # 外側の変数を変更するにはnonlocalが必要
        count += step
        return count

    return increment

counter = make_counter(10)
print(counter())    # 11
print(counter(5))   # 16`,
        },
      ],
      summary:
        '関数の引数は柔軟に設定でき、*演算子でキーワード専用引数を強制できます。クロージャとnonlocalを使ってステートを管理できます。',
    },
    exercises: [
      {
        id: 'ex-l4-1',
        title: '汎用的な集計関数',
        type: 'coding',
        prompt:
          '数値のリストを受け取り、統計情報を辞書で返す関数を実装してください。\n\n要件:\n- count, sum, min, max, average を含む辞書を返す\n- 空リストの場合は適切に処理する\n- 型ヒントを付ける',
        starter_code: `from typing import List, Dict, Union

def calculate_stats(numbers: List[float]) -> Dict[str, Union[int, float, None]]:
    """数値リストの統計情報を返す"""
    # ここに実装してください
    pass


print(calculate_stats([1, 2, 3, 4, 5]))
# {'count': 5, 'sum': 15.0, 'min': 1, 'max': 5, 'average': 3.0}

print(calculate_stats([]))
# {'count': 0, 'sum': 0, 'min': None, 'max': None, 'average': None}`,
        hints: [
          '組み込み関数 sum(), min(), max(), len() を活用しましょう',
          '空リストの場合は min/max/average を None で返しましょう',
        ],
      },
    ],
  },

  'l-5': {
    ...LESSONS[4],
    description: 'Pythonの主要なコレクション型とその操作方法を習得します',
    content: {
      introduction:
        'Pythonのコレクション型（list, tuple, dict, set）は非常に強力です。適切な型を選ぶことがPythonicなコードの第一歩です。',
      key_concepts: [
        {
          title: 'list と tuple の使い分け',
          explanation:
            'listは変更可能（mutable）、tupleは変更不可（immutable）。変更しないデータにはtupleを使うと意図が明確になり、パフォーマンスも向上します。',
          example: `# list: 変更可能なシーケンス
scores: list[int] = [85, 92, 78, 95]
scores.append(88)
scores.sort(reverse=True)
print(scores)  # [95, 92, 88, 85, 78]

# tuple: 変更不可のシーケンス（座標、RGB値など）
point: tuple[int, int] = (10, 20)
color: tuple[int, int, int] = (255, 128, 0)

# アンパック
x, y = point
r, g, b = color`,
        },
        {
          title: 'dict の高度な操作',
          explanation:
            'dictはキーと値のマッピング。get()でデフォルト値指定、setdefault()でデフォルト設定、defaultdictで欠損キー自動生成ができます。',
          example: `from collections import defaultdict

# 通常の辞書
user: dict[str, str | int] = {"name": "田中", "age": 25}

# 安全な値取得
email = user.get("email", "未登録")  # KeyErrorが起きない

# 辞書の内包表記
squares = {n: n**2 for n in range(1, 6)}
# {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# defaultdict（カウンティングに便利）
counter: defaultdict[str, int] = defaultdict(int)
for char in "hello world":
    counter[char] += 1`,
        },
        {
          title: 'set の活用',
          explanation:
            'setは重複を許さないコレクション。集合演算（和集合、積集合、差集合）がO(1)で行えます。',
          example: `# 重複除去
tags = ["python", "web", "python", "api", "web"]
unique_tags = list(set(tags))
# ['api', 'web', 'python']（順序不定）

# 集合演算
python_devs = {"田中", "鈴木", "佐藤"}
js_devs = {"山田", "鈴木", "高橋"}

both = python_devs & js_devs       # 積集合: {'鈴木'}
either = python_devs | js_devs     # 和集合
only_python = python_devs - js_devs # 差集合: {'田中', '佐藤'}

# 高速な存在確認（listのO(n)より高速）
"鈴木" in python_devs  # True（O(1)）`,
        },
      ],
      summary:
        '変更しないデータにはtuple、重複なし集合にはset、キーバリューにはdict。適切なコレクション型の選択がPythonicなコードの基本です。',
    },
    exercises: [
      {
        id: 'ex-l5-1',
        title: '単語カウンター',
        type: 'coding',
        prompt:
          'テキストから単語の出現回数をカウントする関数を実装してください。\n\n要件:\n- 大文字小文字を区別しない\n- 出現回数が多い順に返す\n- 上位N件のみ返すオプション引数を持つ',
        starter_code: `from typing import Optional

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
print(count_words(text, top_n=3))
# [('the', 3), ('fox', 2), ('quick', 1)] などの期待出力`,
        hints: [
          'text.lower().split() で単語のリストを取得できます',
          'collections.Counter を使うと簡単に実装できます',
          'Counter.most_common(n) で上位N件を取得できます',
        ],
      },
    ],
  },

  'l-6': {
    ...LESSONS[5],
    description: 'Pythonのクラスとオブジェクト指向プログラミングの基礎を学びます',
    content: {
      introduction:
        'Pythonのクラスは他の言語と似た概念ですが、独自の特徴があります。__init__、self、継承など、Pythonらしいクラスの書き方を学びましょう。',
      key_concepts: [
        {
          title: 'クラスの定義と__init__',
          explanation:
            'Pythonではclassキーワードでクラスを定義します。コンストラクタは__init__メソッドで定義し、第一引数にselfを受け取ります。',
          example: `class Dog:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age

    def bark(self) -> str:
        return f"{self.name}が吠えた！"

    def __repr__(self) -> str:
        return f"Dog(name={self.name!r}, age={self.age})"

# 使用例
dog = Dog("ポチ", 3)
print(dog.bark())  # ポチが吠えた！
print(dog)         # Dog(name='ポチ', age=3)`,
        },
        {
          title: 'データクラス（dataclass）',
          explanation:
            'Python 3.7以降では@dataclassデコレータを使うことで、ボイラープレートコードを減らせます。自動的に__init__、__repr__、__eq__が生成されます。',
          example: `from dataclasses import dataclass, field
from typing import List

@dataclass
class Student:
    name: str
    grade: int
    scores: List[int] = field(default_factory=list)

    @property
    def average(self) -> float:
        if not self.scores:
            return 0.0
        return sum(self.scores) / len(self.scores)

s = Student("田中太郎", 3, [85, 90, 78])
print(s.average)  # 84.33...`,
        },
        {
          title: '継承とsuper()',
          explanation:
            'Pythonの継承はシンプルで直感的です。super()を使って親クラスのメソッドを呼び出せます。多重継承もサポートしています。',
          example: `class Animal:
    def __init__(self, name: str):
        self.name = name

    def speak(self) -> str:
        raise NotImplementedError

class Cat(Animal):
    def speak(self) -> str:
        return f"{self.name}がニャーと鳴いた"

class Dog(Animal):
    def speak(self) -> str:
        return f"{self.name}がワンと吠えた"

animals = [Cat("ミケ"), Dog("ポチ")]
for animal in animals:
    print(animal.speak())`,
        },
      ],
      summary:
        'Pythonのクラスは強力で柔軟です。dataclassを使ってボイラープレートを削減し、型ヒントを活用して読みやすいコードを書きましょう。',
    },
    exercises: [
      {
        id: 'ex-l6-1',
        title: 'クラスの実装',
        type: 'coding',
        prompt:
          '銀行口座を表すBankAccountクラスを実装してください。\n\n要件:\n- 残高(balance)を持つ\n- deposit(amount)で入金\n- withdraw(amount)で出金（残高不足時はValueErrorを発生させる）\n- 取引履歴(transactions)を記録する',
        starter_code: `from dataclasses import dataclass, field
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
print(account.transactions)`,
        hints: [
          'depositはbalanceに加算するだけ',
          'withdrawはbalanceが不足する場合ValueError("残高不足")を発生させる',
          'transactionsには{"type": "deposit", "amount": 金額}の形式で追加する',
        ],
      },
      {
        id: 'ex-l6-2',
        title: 'コードレビュー演習',
        type: 'review',
        prompt: `以下のPythonコードをレビューしてください。改善点とその理由を具体的に説明してください。

\`\`\`python
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
\`\`\``,
        hints: [
          'クラス名の命名規則（PEP8）を確認しよう',
          '変数名の読みやすさを考えよう',
          '文字列の連結よりも効率的な方法がある',
          '型ヒントの追加を検討しよう',
        ],
      },
    ],
  },
};

// ===== ユーティリティ関数 =====

export function getLessonById(id: string): LessonDetail | null {
  return LESSON_DETAILS[id] ?? null;
}

export function getLessonMeta(id: string): LessonMeta | null {
  return LESSONS.find((l) => l.id === id) ?? null;
}
