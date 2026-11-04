from datetime import datetime, timezone

from django.db import migrations

STARTER_POSTS = [
    {
        'author_name': 'Fahim',
        'title': "Three slow days on St. Martin's Island",
        'created_at': datetime(2026, 10, 2, 9, 30, tzinfo=timezone.utc),
        'categories': ['Beach', 'Tips'],
        'image_path': '/images/st2.jpg',
        'body': (
            "We took the morning ship from Teknaf and arrived to turquoise water and a sky full of gulls. "
            "St. Martin's is small enough to walk end to end, so we rented bicycles and spent the first day "
            "circling the island, stopping for coconut water whenever we got thirsty.\n\n"
            "The best moment was sunset at the western beach, where the coral rocks turn gold. If you go, stay "
            "at least two nights so you can visit Chera Dwip at low tide, and carry cash — card machines are "
            "rare on the island."
        ),
    },
    {
        'author_name': 'Sakib',
        'title': 'Into the mangroves: a Sundarbans boat trip',
        'created_at': datetime(2026, 9, 18, 7, 0, tzinfo=timezone.utc),
        'categories': ['Nature', 'Adventure'],
        'image_path': '/images/su3.jpg',
        'body': (
            "Our boat left Khulna before dawn and by mid-morning we were drifting through narrow channels lined "
            "with sundari trees. We didn't see a tiger, but we did spot spotted deer, kingfishers and a crocodile "
            "sunning itself on the bank.\n\n"
            "Book with a licensed operator, pack mosquito repellent and a light rain jacket, and keep your voice "
            "low on the smaller creeks — that's when the wildlife comes out."
        ),
    },
    {
        'author_name': 'Eshen',
        'title': 'Tea, rain and lemon tea in Srimangal',
        'created_at': datetime(2026, 8, 30, 11, 15, tzinfo=timezone.utc),
        'categories': ['Nature', 'Food'],
        'image_path': '/images/sr2.jpeg',
        'body': (
            "Srimangal is the tea capital of Bangladesh, and the rolling green estates look unreal after a "
            "monsoon shower. We walked through Lawachara National Park in the morning and spent the afternoon "
            "trying the famous seven-layer tea.\n\n"
            "It's an easy train ride from Dhaka, and the cooler hill air is a welcome break from the city."
        ),
    },
    {
        'author_name': 'Taskin',
        'title': 'A walk through old Dhaka and Ahsan Manzil',
        'created_at': datetime(2026, 8, 12, 15, 45, tzinfo=timezone.utc),
        'categories': ['Culture'],
        'image_path': '/images/a1.jpeg',
        'body': (
            "The pink palace of Ahsan Manzil sits right on the Buriganga river, and the museum inside tells the "
            "story of the Nawabs of Dhaka. Afterwards we wandered the lanes of old Dhaka, eating biryani and "
            "watching rickshaws squeeze through impossibly narrow streets.\n\n"
            "Go early in the day to avoid the heat, and take a short boat ride across the river for the best "
            "view of the palace."
        ),
    },
]


def seed(apps, schema_editor):
    Post = apps.get_model('PostsApp', 'Post')
    if Post.objects.exists():
        return
    for data in STARTER_POSTS:
        data = dict(data)
        created_at = data.pop('created_at')
        post = Post.objects.create(**data)
        # auto_now_add ignores the value passed to create(), so set it afterwards.
        Post.objects.filter(pk=post.pk).update(created_at=created_at, updated_at=created_at)


def unseed(apps, schema_editor):
    Post = apps.get_model('PostsApp', 'Post')
    Post.objects.filter(author__isnull=True, title__in=[p['title'] for p in STARTER_POSTS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('PostsApp', '0004_post_postlike'),
    ]

    operations = [
        migrations.RunPython(seed, unseed),
    ]
