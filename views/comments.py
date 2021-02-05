from flask import Response, request
from flask_restful import Resource
from mongoengine import DoesNotExist, Q
import models
import json

def serialize_queryset(queryset):
    serialized_list = [
        item.to_dict() for item in queryset
    ]
    return serialized_list

class CommentListEndpoint(Resource):
    def get(self, post_id):
        data = models.Comment.objects.filter(post=post_id)
        data = serialize_queryset(data)
        return Response(json.dumps(data), mimetype="application/json", status=200)

    def post(self, post_id):
        print(post_id)
        body = request.get_json()
        print(body)
        body['post'] = post_id
        comment = models.Comment(**body).save()
        return Response(comment.to_json(), mimetype="application/json", status=201)

class CommentDetailEndpoint(Resource):
    def put(self, id):
        comment = models.Comment.objects.get(id=id)
        request_data = request.get_json()
        comment.comment = request_data.get('comment')
        comment.author = request_data.get('author')
        comment.save()
        print(comment.to_json())
        return Response(comment.to_json(), mimetype="application/json", status=200)

    def delete(self, id):
        comment = models.Comment.objects.get(id=id)
        comment.delete()
        serialized_data = {
            'message': 'Post {} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)

    def get(self, id):
        print(id)
        comment = models.Comment.objects.get(post=id)
        return Response(comment.to_json(), mimetype="application/json", status=200)

def initialize_routes(api):
    api.add_resource(CommentListEndpoint, '/api/posts/<post_id>/comments', '/api/posts/<post_id>/comments/')
    api.add_resource(CommentDetailEndpoint, '/api/comments/<id>', '/api/comments/<id>/')
