#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_assessment_questions
python manage.py seed_rich_lessons
python manage.py collectstatic --no-input
