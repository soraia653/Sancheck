
# Sancheck

Sancheck, a korean word (산책) meaning "taking a walk", is a dog park recommendation website aiming at helping it's users find safe and dog friendly places for their little furry ones. The users can log in and immediately check for parks around me or they can search for parks anywhere in the world using the search functionality.

## Distinctiveness and Complexity

Sancheck is a complex project since it uses the Google Maps API to have access to thousands of park locations across the world.

The use of third-party APIs was only touched briefly in one of CS50's classes.

#### Why Use Google Maps API?
I decided to build something that could be used straight away by end users (although there are many open points to work on), so instead of building a simple `DogPark` model where the website would be fully dependent on user input, I decided to already provide the users thousands of options and add a tagging option - where the user can see in a matter of seconds what would people think about the selected park.

Another distinct feature is the possibility to upvote tags. All tags display a count of how many users have upvoted that tag, allowing for a more accurate representation of the park characteristics.

The usage of this API required reading through extensive document and learning its innerworks in order to be able to successfully implement it.

## File Structure
```
capstone
    > capenv -- virtual env settings
    > capstone
        > capstone
            > settings.py -- added additional settings.
        > sancheck
            > static
                > sancheck
                    > app_images -- stores images used in webpage design.
                    > css -- contains css code files.
                        > base.css
                        > dashboard.css
                    > javascript -- contains js code files.
                        > base.js
                        > dashboard.js
            > templates
                > registration
                    > login.html
                    > password_reset_done.html
                    > password_reset_form.html
                > sancheck
                    > base.html
                    > dashboard.html
                    > layout.html
                    > register.html
            > admin.py -- added models to admin settings.
            > models.py -- created 2 models.
            > urls.py -- added URL paths to all views.
            > views.py -- created multiple views.
        > sent_emails   -- storage folder of sent emails.
        > db.sqlite3
        > manage.py
    > README.md
    > requirements.txt -- required libraries
```
## Run Locally


Navigate to the project folder and create a virtual environment and activate it.
```bash
virtualenv venv
source venv/scripts/activate
```

Install all required packages.

```bash
pip install -r requirements.txt
```

Initialize the project.

```bash
py manage.py makemigrations sancheck
py manage.py migrate
py manage.py createsuperuser
```

Launch the Django server.

```bash
python manage.py runserver
```


## API Reference

#### Get park tags

```http
  GET /sancheck/tags/${park_id}
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `park_id` | `string` | **Required**. ID of the park. |

#### Upvote a tag

```http
  PUT /sancheck/upvote_tag/${tag_id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `tag_id`      | `integer` | **Required**. Id of the tag. |

#### Create a tag

```http
  PUT /sancheck/create_tag/${park_id}/${tag}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `park_id` | `string` | **Required**. ID of the park. |
| `tag`      | `string` | **Required**. Name of the tag. |