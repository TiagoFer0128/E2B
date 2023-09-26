# coding: utf-8

"""
    Devbook

    Devbook API

    The version of the OpenAPI document: 1.0.0
    Generated by OpenAPI Generator (https://openapi-generator.tech)

    Do not edit the class manually.
"""  # noqa: E501


from __future__ import annotations
import pprint
import re  # noqa: F401
import json


from typing import Optional
from pydantic import BaseModel, StrictStr


class EnvironmentTitleUpdate(BaseModel):
    """
    EnvironmentTitleUpdate
    """

    title: Optional[StrictStr] = None

    """Pydantic configuration"""
    model_config = {
        "populate_by_name": True,
        "validate_assignment": True,
    }

    def to_str(self) -> str:
        """Returns the string representation of the model using alias"""
        return pprint.pformat(self.model_dump(by_alias=True))

    def to_json(self) -> str:
        """Returns the JSON representation of the model using alias"""
        return json.dumps(self.to_dict())

    @classmethod
    def from_json(cls, json_str: str) -> EnvironmentTitleUpdate:
        """Create an instance of EnvironmentTitleUpdate from a JSON string"""
        return cls.from_dict(json.loads(json_str))

    def to_dict(self):
        """Returns the dictionary representation of the model using alias"""
        _dict = self.model_dump(by_alias=True, exclude={}, exclude_none=True)
        return _dict

    @classmethod
    def from_dict(cls, obj: dict) -> EnvironmentTitleUpdate:
        """Create an instance of EnvironmentTitleUpdate from a dict"""
        if obj is None:
            return None

        if not isinstance(obj, dict):
            return EnvironmentTitleUpdate.model_validate(obj)

        # raise errors for additional fields in the input
        for _key in obj.keys():
            if _key not in ["title"]:
                raise ValueError(
                    "Error due to additional fields (not defined in EnvironmentTitleUpdate) in the input: "
                    + obj
                )

        _obj = EnvironmentTitleUpdate.model_validate({"title": obj.get("title")})
        return _obj
