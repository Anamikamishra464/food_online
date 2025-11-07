from django.core.exceptions import ValidationError
import os

def allow_only_images_validators(value):
    ext=os.path.splitext(value.name)[1]
    print(ext)
    valid_extension=['.png','.jpg','.jpeg']
    if not ext.lower() in valid_extension:
        raise ValidationError('unsupported file extension. Allowed extension: ' +str(valid_extension))