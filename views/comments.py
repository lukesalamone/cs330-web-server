from flask import Response, request
from flask_restful import Resource
from mongoengine import DoesNotExist, Q
import models
import json

def serialize_queryset(queryset):
    serialized_list = [
        json.dumps(item) for item in queryset
    ]
    return serialized_list

class CommentListEndpoint(Resource):

    def get(self):
        data = models.Comment.objects
        return Response(data.__dict__, mimetype="application/json", status=200)

    def post(self):
        body = request.get_json()
        comment = models.Comment(**body).save()
        serialized_data = {
            'id': str(comment.id),
            'message': 'Comment {0} successfully created.'.format(comment.id)
        }
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
        comment = models.Comment.objects.get(id=id)
        return Response(comment.to_json(), mimetype="application/json", status=200)

def initialize_routes(api):
    api.add_resource(CommentListEndpoint, '/api/comments', '/api/comments/')
    api.add_resource(CommentDetailEndpoint, '/api/comments/<id>', '/api/comments/<id>/')
